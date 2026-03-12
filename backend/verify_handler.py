import os
import uuid
import traceback
from pathlib import Path

from flask import jsonify
from werkzeug.utils import secure_filename

# Essential local imports
from ocr_pipeline import process_certificate_file, normalize_extracted_data, create_certificate_hash

# --- CRITICAL BLOCKCHAIN IMPORT ---
# We import from the sibling module `blockchain_service.py` in the same folder.
try:
    from blockchain_service import verify_hash_on_blockchain
except ImportError as e:
    print(
        f"WARNING: Cannot import verify_hash_on_blockchain from blockchain_service: {e}. "
        "Blockchain checks will be disabled."
    )

    # Safety fallback function: always report hash as not on-chain
    def verify_hash_on_blockchain(hash_val):
        return False
# --- END CRITICAL BLOCKCHAIN IMPORT ---


def verify_certificate_upload(file, calculate_match_percentage_excel=None):
    """
    Core logic for certificate verification:
    1. Blockchain Authenticity Check (H_OCR hash lookup)
    2. Supabase O(1) lookup in official_records
    3. Two-tier status determination (verified / forgery / tampered_record / not_found)
    """
    try:
        # --- PHASE 0: Setup and OCR Extraction ---
        uploads_dir = Path(__file__).parent / "uploads" / "verify"
        uploads_dir.mkdir(parents=True, exist_ok=True)

        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        save_path = uploads_dir / unique_name
        file.save(str(save_path))

        print(f"[VERIFY] Extracting data from: {save_path}")
        extracted_data = process_certificate_file(str(save_path))
        extracted_data = normalize_extracted_data(extracted_data)

        print(
            f"[VERIFICATION] Normalized extracted data fields: "
            f"{list(extracted_data.keys())}"
        )

        if extracted_data.get("error"):
            return (
                jsonify({
                    "success": False,
                    "error": "Failed to extract certificate data",
                    "details": extracted_data.get("error"),
                }), 400,
            )

        # Initialize verification result structure
        verification_result = {
            "extracted_data": extracted_data,
            "database_match": None,
            "match_percentage": 0,
            "verification_status": "unverified",
            "is_on_blockchain": False,  # NEW
            "blockchain_hash": None,    # NEW
            "template_match": False,
            "alert_sent": False,
            "matched_file": None,
            "discrepancy_details": None, # NEW
            "suggestion": None,          # NEW
        }
        
        # --- PHASE 1: BLOCKCHAIN AUTHENTICITY CHECK ---
        
        # 1. Calculate the hash (H_OCR) from the extracted data
        certificate_hash = create_certificate_hash(extracted_data)
        verification_result["blockchain_hash"] = certificate_hash
        
        # 2. Check the hash against the blockchain (read-only, gas-free)
        is_on_blockchain = verify_hash_on_blockchain(certificate_hash)
        verification_result["is_on_blockchain"] = is_on_blockchain

        print(f"[VERIFICATION] Calculated Hash (H_OCR): {certificate_hash}")
        print(f"[VERIFICATION] Blockchain Status: {'VERIFIED' if is_on_blockchain else 'NOT FOUND'}")
        
        # Immediate success if hash is found on the blockchain
        if is_on_blockchain:
            verification_result["verification_status"] = "blockchain_verified"
            verification_result["message"] = "Certificate is fully verified against the immutable blockchain record."
            # We skip the Excel search here as authenticity is proven, but we will proceed to Phase 2 
            # to retrieve the local data for display purposes if possible.
        
        # --- PHASE 2: LOCAL DATABASE MATCH (Supabase O(1) Lookup) ---
        best_match = None
        best_match_score = 0
        subject_match_info = {}

        student_id = extracted_data.get("student_id", "").strip()
        semester   = extracted_data.get("semester",   "").strip()

        print(f"[VERIFICATION] Searching Supabase for Student ID: {student_id}  Semester: {semester or '(any)'}")
        try:
            # Import supabase client from app module
            try:
                import app as _app
                _supabase = _app.supabase
            except Exception:
                _supabase = None

            if _supabase and student_id:
                query = (
                    _supabase.table("official_records")
                    .select("*")
                    .eq("student_id", student_id)
                )
                # Chain semester filter only when the OCR extracted a value
                if semester:
                    query = query.eq("semester", semester)
                else:
                    print("[VERIFICATION] semester not extracted – matching by student_id only.")

                db_result = query.execute()

                if db_result.data and len(db_result.data) > 0:
                    best_match = db_result.data[0]  # The official database row

                    match_score, current_subject_match_info = calculate_match_percentage_db(
                        extracted_data, best_match
                    )

                    best_match_score = match_score
                    subject_match_info = current_subject_match_info
                    print(f"[VERIFICATION] Supabase Match score: {best_match_score}%")
            else:
                if not _supabase:
                    print("[VERIFICATION] Supabase client unavailable – skipping DB lookup.")
                else:
                    print("[VERIFICATION] No student_id extracted – skipping DB lookup.")

            # --- Populate result structure from best_match (if found) ---
            if best_match:
                verification_result["database_match"] = {
                    "student_id": best_match.get("student_id", ""),
                    "student_name": best_match.get("student_name", ""),
                    "university": best_match.get("institution_name", ""),
                    "course": best_match.get("course_name", ""),
                    "degree_type": best_match.get("degree_type", ""),
                    "cgpa": best_match.get("cgpa", ""),
                    "year_of_passing": best_match.get("year_of_passing", ""),
                    "issuing_authority": best_match.get("institution_name", ""),
                }
                verification_result["match_percentage"] = best_match_score
                verification_result["subject_match_info"] = subject_match_info

        except Exception as db_error:
            print(f"[VERIFICATION] Database search error: {str(db_error)}")

        # --- PHASE 3: TWO-TIER FINAL STATUS DETERMINATION ---
        # Tier 1 – Blockchain:  Is H_OCR on-chain?
        # Tier 2 – Fuzzy match: Does OCR data agree with official_records?
        #
        # Decision matrix:
        #   blockchain=True  AND score > 80  → "verified"
        #   blockchain=True  AND score <= 80  → "forgery"   (hash matches but data drifted)
        #   blockchain=False AND best_match    → "tampered_record"
        #   no match at all                   → "not_found"

        HIGH_MATCH_THRESHOLD = 80.0
        MEDIUM_MATCH_THRESHOLD = 60.0

        db_blockchain_hash = best_match.get("blockchain_hash") if best_match else None

        # Re-check blockchain using the DB-stored hash (authoritative)
        if db_blockchain_hash:
            is_on_blockchain = verify_hash_on_blockchain(db_blockchain_hash)
            verification_result["is_on_blockchain"] = is_on_blockchain
            print(
                f"[VERIFICATION] DB hash blockchain check: "
                f"{'VERIFIED' if is_on_blockchain else 'NOT FOUND'}"
            )

        if is_on_blockchain and best_match_score > HIGH_MATCH_THRESHOLD:
            verification_result["verification_status"] = "verified"
            verification_result["message"] = (
                f"Certificate verified on blockchain and database match {best_match_score:.2f}%."
            )
        elif is_on_blockchain and best_match is not None and best_match_score <= HIGH_MATCH_THRESHOLD:
            # Hash is on-chain but content doesn't match official records → likely forgery
            verification_result["verification_status"] = "forgery"
            verification_result["discrepancy_details"] = (
                f"Blockchain hash found but data match is only {best_match_score:.2f}% "
                "– certificate content may have been altered."
            )
            verification_result["suggestion"] = (
                "Contact the issuing institution for manual review."
            )
        elif not is_on_blockchain and best_match is not None:
            # Record in DB but hash not on-chain → tampered
            verification_result["verification_status"] = "tampered_record"
            verification_result["discrepancy_details"] = (
                "Student record found in database but certificate hash is NOT on the blockchain. "
                "The document may have been tampered with."
            )
        elif is_on_blockchain and best_match is None:
            # Hash on-chain but no DB row (e.g., student uploaded their own cert)
            verification_result["verification_status"] = "verified"
            verification_result["message"] = (
                "Certificate hash verified on blockchain. "
                "No detailed record found in institutional database."
            )
        elif best_match and best_match_score >= HIGH_MATCH_THRESHOLD:
            # Fallback: good DB match even without blockchain confirmation
            verification_result["verification_status"] = "verified"
            verification_result["message"] = (
                f"High-confidence database match ({best_match_score:.2f}%). "
                "Certificate is considered verified."
            )
        elif best_match and best_match_score >= MEDIUM_MATCH_THRESHOLD:
            verification_result["verification_status"] = "semi-verified"
            verification_result["message"] = (
                f"Partial match with institutional records ({best_match_score:.2f}%). "
                "Manual review recommended."
            )
        else:
            verification_result["verification_status"] = "not_found"
            verification_result["error_message"] = (
                "Certificate not found on the blockchain or in the institutional registry."
            )


    except Exception as e:
        # General error handling
        print(f"Verification error: {str(e)}")
        traceback.print_exc()
        verification_result["verification_status"] = "error"
        verification_result["error_message"] = f"General processing error: {str(e)}"
        
    finally:
        # Clean up temporary file
        try:
            os.remove(str(save_path))
        except Exception:
            pass

    # Final result return
    if verification_result["verification_status"] == "error":
        return jsonify({"success": False, "error": verification_result["error_message"]}), 500
    
    return jsonify({"success": True, "result": verification_result}), 200


# --- ESSENTIAL HELPER FUNCTIONS (KEPT FROM ORIGINAL CODE) ---

def calculate_match_percentage_excel(extracted_data, excel_row):
    """Calculate match percentage between extracted data and Excel row."""
    total_fields = 0
    matched_fields = 0
    match_details = []

    # Compare student_id (exact match - highest priority)
    total_fields += 2 
    extracted_id = extracted_data.get("student_id", "").strip().lower()
    excel_id = excel_row.get("student_id", "").strip().lower()
    if extracted_id == excel_id:
        matched_fields += 2
        match_details.append(f"✓ student_id: '{extracted_id}' == '{excel_id}'")
    else:
        match_details.append(f"✗ student_id: '{extracted_id}' != '{excel_id}'")

    # Compare student name
    total_fields += 1
    extracted_name = extracted_data.get("student_name", "").strip().lower()
    excel_name = excel_row.get("student_name", "").strip().lower()
    if extracted_name and excel_name:
        if (
            extracted_name == excel_name
            or extracted_name in excel_name
            or excel_name in extracted_name
        ):
            matched_fields += 1
            match_details.append(
                f"✓ student_name: '{extracted_name}' ≈ '{excel_name}'"
            )
        else:
            match_details.append(
                f"✗ student_name: '{extracted_name}' != '{excel_name}'"
            )
    else:
        match_details.append("⊘ student_name: Empty field")

    # Compare university
    total_fields += 1
    extracted_uni = extracted_data.get("university_name", "").strip().lower()
    excel_uni = excel_row.get("university_name", "").strip().lower()
    if extracted_uni and excel_uni:
        if (
            extracted_uni == excel_uni
            or extracted_uni in excel_uni
            or excel_uni in extracted_uni
        ):
            matched_fields += 1
            match_details.append(
                f"✓ university_name: '{extracted_uni}' ≈ '{excel_uni}'"
            )
        else:
            match_details.append(
                f"✗ university_name: '{extracted_uni}' != '{excel_uni}'"
            )
    else:
        match_details.append(
            f"⊘ university_name: Empty field - extracted:'{extracted_uni}', excel:'{excel_uni}'"
        )

    # Compare course
    total_fields += 1
    extracted_course = extracted_data.get("course_name", "").strip().lower()
    excel_course = excel_row.get("course_name", "").strip().lower()
    if extracted_course and excel_course:
        if (
            extracted_course == excel_course
            or extracted_course in excel_course
            or excel_course in extracted_course
        ):
            matched_fields += 1
            match_details.append(
                f"✓ course_name: '{extracted_course}' ≈ '{excel_course}'"
            )
        else:
            match_details.append(
                f"✗ course_name: '{extracted_course}' != '{excel_course}'"
            )
    else:
        match_details.append("⊘ course_name: Empty field")

    # Compare degree type
    total_fields += 1
    extracted_degree = extracted_data.get("degree_type", "").strip().lower()
    excel_degree = excel_row.get("degree_type", "").strip().lower()
    if extracted_degree and excel_degree:
        if (
            extracted_degree == excel_degree
            or extracted_degree in excel_degree
            or excel_degree in extracted_degree
        ):
            matched_fields += 1
            match_details.append(
                f"✓ degree_type: '{extracted_degree}' ≈ '{excel_degree}'"
            )
        else:
            match_details.append(
                f"✗ degree_type: '{extracted_degree}' != '{excel_degree}'"
            )
    else:
        match_details.append("⊘ degree_type: Empty field")

    # Compare CGPA (allow small variance)
    total_fields += 1
    extracted_cgpa = extracted_data.get("cgpa", "").strip()
    excel_cgpa = excel_row.get("cgpa", "").strip()
    if extracted_cgpa and excel_cgpa:
        try:
            extracted_cgpa_float = float(extracted_cgpa)
            excel_cgpa_float = float(excel_cgpa)
            if abs(extracted_cgpa_float - excel_cgpa_float) <= 0.1:
                matched_fields += 1
                match_details.append(
                    f"✓ cgpa: {extracted_cgpa} ≈ {excel_cgpa}"
                )
            else:
                match_details.append(
                    f"✗ cgpa: {extracted_cgpa} != {excel_cgpa}"
                )
        except Exception:
            if extracted_cgpa == excel_cgpa:
                matched_fields += 1
                match_details.append(
                    f"✓ cgpa: '{extracted_cgpa}' == '{excel_cgpa}'"
                )
            else:
                match_details.append(
                    f"✗ cgpa: '{extracted_cgpa}' != '{excel_cgpa}'"
                )
    else:
        match_details.append("⊘ cgpa: Empty field")

    # Compare year of passing
    total_fields += 1
    extracted_year = extracted_data.get("year_of_passing", "").strip()
    excel_year = excel_row.get("year_of_passing", "").strip()
    if extracted_year and excel_year:
        if extracted_year == excel_year:
            matched_fields += 1
            match_details.append(
                f"✓ year_of_passing: '{extracted_year}' == '{excel_year}'"
            )
        else:
            match_details.append(
                f"✗ year_of_passing: '{extracted_year}' != '{excel_year}'"
            )
    else:
        match_details.append("⊘ year_of_passing: Empty field")

    # Compare issuing authority
    total_fields += 1
    extracted_issuer = extracted_data.get("issuing_authority", "").strip().lower()
    excel_issuer = excel_row.get("issuing_authority", "").strip().lower()
    if extracted_issuer and excel_issuer:
        if (
            extracted_issuer == excel_issuer
            or extracted_issuer in excel_issuer
            or excel_issuer in extracted_issuer
        ):
            matched_fields += 1
            match_details.append(
                f"✓ issuing_authority: '{extracted_issuer}' ≈ '{excel_issuer}'"
            )
        else:
            match_details.append(
                f"✗ issuing_authority: '{extracted_issuer}' != '{excel_issuer}'"
            )
    else:
        match_details.append("⊘ issuing_authority: Empty field")

    # ===== SUBJECT GRADES COMPARISON (Keep the complex parsing and comparison logic) =====
    extracted_subjects = extracted_data.get("subject_grades", [])
    excel_subjects_str = excel_row.get("subject_grades", "").strip()
    
    subject_match_info = {
        "matched": [],
        "corrected": [],
        "missing_in_excel": [],
        "missing_in_extracted": []
    }
    
    if excel_subjects_str:
        excel_subjects = []
        if isinstance(excel_subjects_str, str) and excel_subjects_str:
            parts = excel_subjects_str.split(';')
            for part in parts:
                part = part.strip()
                if ':' in part:
                    subj_part, grade_part = part.split(':', 1)
                    subj_name = subj_part.strip()
                    grade = grade_part.strip().split('(')[0].strip()
                    
                    credits = None
                    if '(' in grade_part and ')' in grade_part:
                        pass 
                    
                    excel_subjects.append({
                        "subject_name": subj_name,
                        "grade": grade,
                        "credits": credits
                    })
        
        if extracted_subjects and excel_subjects:
            total_fields += 2 
            subject_matches = 0
            
            def normalize_subject(name):
                return name.lower().replace('.', '').replace(',', '').replace('  ', ' ').strip()
            
            excel_subject_map = {normalize_subject(s["subject_name"]): s for s in excel_subjects}
            used_excel_subjects = set()
            
            def is_lab_course(name, credits):
                name_lower = name.lower()
                is_lab_by_name = 'lab' in name_lower or 'laboratory' in name_lower or 'practical' in name_lower
                is_lab_by_credits = credits and (str(credits) == '1' or credits == 1)
                return is_lab_by_name or is_lab_by_credits
            
            for ext_subj in extracted_subjects:
                ext_name = ext_subj.get("subject_name", "").strip()
                ext_name_norm = normalize_subject(ext_name)
                ext_grade = ext_subj.get("grade", "").strip()
                ext_credits = ext_subj.get("credits", "")
                
                try:
                    ext_credits_int = int(ext_credits) if ext_credits else None
                except:
                    ext_credits_int = None
                
                # Try exact match first
                if ext_name_norm in excel_subject_map and ext_name_norm not in used_excel_subjects:
                    excel_match = excel_subject_map[ext_name_norm]
                    subject_matches += 1
                    used_excel_subjects.add(ext_name_norm)
                    subject_match_info["matched"].append({
                        "extracted": ext_name, "excel": excel_match["subject_name"],
                        "extracted_grade": ext_grade, "excel_grade": excel_match["grade"]
                    })
                else:
                    # Try fuzzy match
                    found_match = False
                    best_match_sub = None
                    best_match_score_sub = 0
                    
                    for excel_name_norm, excel_subj in excel_subject_map.items():
                        if excel_name_norm in used_excel_subjects:
                            continue
                        
                        is_substring = ext_name_norm in excel_name_norm or excel_name_norm in ext_name_norm
                        similarity_score = similarity_ratio(ext_name_norm, excel_name_norm)
                        
                        if is_substring or similarity_score > 0.7:
                            match_score = similarity_score if not is_substring else 0.9
                            
                            ext_is_lab = is_lab_course(ext_name, ext_credits_int)
                            excel_is_lab = is_lab_course(excel_subj["subject_name"], None)
                            
                            if ext_is_lab == excel_is_lab:
                                match_score += 0.2
                            
                            if match_score > best_match_score_sub:
                                best_match_score_sub = match_score
                                best_match_sub = (excel_name_norm, excel_subj)
                    
                    if best_match_sub and best_match_score_sub > 0.7:
                        excel_name_norm, excel_subj = best_match_sub
                        subject_matches += 0.7
                        used_excel_subjects.add(excel_name_norm)
                        subject_match_info["corrected"].append({
                            "extracted": ext_name, "excel": excel_subj["subject_name"],
                            "extracted_grade": ext_grade, "excel_grade": excel_subj["grade"],
                            "similarity": "fuzzy"
                        })
                        found_match = True
                    
                    if not found_match:
                        subject_match_info["missing_in_excel"].append(ext_name)
            
            for excel_subj in excel_subjects:
                excel_name_norm = normalize_subject(excel_subj["subject_name"])
                if excel_name_norm not in used_excel_subjects:
                    subject_match_info["missing_in_extracted"].append(excel_subj["subject_name"])
            
            max_subjects = max(len(extracted_subjects), len(excel_subjects))
            if max_subjects > 0:
                subject_match_ratio = subject_matches / max_subjects
                matched_fields += 2 * subject_match_ratio
                match_details.append(
                    f"{'✓' if subject_match_ratio > 0.7 else '⚠' if subject_match_ratio > 0.3 else '✗'} "
                    f"subjects: {subject_matches}/{max_subjects} matched (extracted: {len(extracted_subjects)}, excel: {len(excel_subjects)})"
                )
            else:
                match_details.append("⊘ subjects: No subjects extracted")
        else:
            match_details.append("⊘ subjects: Empty in one or both records")
    else:
        match_details.append("⊘ subjects: No subjects in Excel")

    percentage = 0.0
    if total_fields > 0:
        percentage = (matched_fields / total_fields) * 100
        percentage = round(percentage, 2)

    print("[MATCH DETAILS] Field-by-field comparison:")
    for detail in match_details:
        print(f"  {detail}")
    print(
        f"[MATCH SUMMARY] Matched {matched_fields}/{total_fields} "
        f"fields = {percentage}%"
    )
    
    return percentage, subject_match_info


import difflib


def similarity_ratio(str1, str2):
    """Calculate similarity between two strings using difflib SequenceMatcher."""
    if not str1 or not str2:
        return 0.0
    return difflib.SequenceMatcher(None, str1.lower().strip(), str2.lower().strip()).ratio()


def calculate_match_percentage_db(extracted_data, db_row):
    """Calculate match percentage between OCR-extracted data and a Supabase official_records row.

    Returns (percentage: float, subject_match_info: dict).
    """
    total_fields = 0
    matched_fields = 0.0
    match_details = []

    def _compare(field_key, db_key=None, weight=1, exact=False):
        nonlocal total_fields, matched_fields
        db_key = db_key or field_key
        v1 = str(extracted_data.get(field_key, "")).strip()
        v2 = str(db_row.get(db_key, "")).strip()
        total_fields += weight
        if not v1 or not v2:
            match_details.append(f"⊘ {field_key}: empty")
            return
        ratio = 1.0 if (exact and v1.lower() == v2.lower()) else similarity_ratio(v1, v2)
        matched_fields += weight * ratio
        sym = "✓" if ratio >= 0.85 else ("⚠" if ratio >= 0.6 else "✗")
        match_details.append(f"{sym} {field_key}: '{v1}' vs '{v2}' ({ratio:.2f})")

    _compare("student_id", weight=2, exact=True)
    _compare("student_name", weight=1)
    _compare("course_name", weight=1)
    _compare("degree_type", weight=1)
    _compare("cgpa", weight=1, exact=True)
    _compare("year_of_passing", weight=1, exact=True)
    # Direct Board/Authority comparison
    db_board = str(db_row.get("issuing_authority", "")).upper().strip()
    ocr_board = str(extracted_data.get("issuing_authority", "")).upper().strip()
    board_score = similarity_ratio(db_board, ocr_board)
    sym = "✓" if board_score > 0.8 else "✗"
    match_details.append(f"  {sym} issuing_authority: '{ocr_board}' vs '{db_board}' ({board_score:.2f})")
    total_fields += 1
    matched_fields += board_score

    percentage = round((matched_fields / total_fields) * 100, 2) if total_fields > 0 else 0.0

    print("[MATCH DETAILS] Field-by-field comparison (DB):")
    for d in match_details:
        print(f"  {d}")
    print(f"[MATCH SUMMARY] {matched_fields:.2f}/{total_fields} fields = {percentage}%")

    return percentage, {}