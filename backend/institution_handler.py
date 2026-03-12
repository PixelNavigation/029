import os
import re
import hashlib
import shutil
import traceback
from datetime import datetime
from pathlib import Path

from flask import request, jsonify, send_file
from werkzeug.utils import secure_filename

# Supabase client – imported lazily inside the handler to avoid circular imports
def _get_supabase():
    try:
        import app as _app
        return _app.supabase
    except Exception:
        return None


def upload_certificates_handler(upload_folder, allowed_file_func, save_metadata_func):
    """Handle bulk certificate uploads from institutions.

    This function mirrors the previous `upload_certificates` route logic
    but is decoupled from the Flask app instance. It relies on helpers
    passed in from `app.py`.
    """
    if "files[]" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files[]")
    institution_id = request.form.get("institution_id", "unknown")
    institution_name = request.form.get("institution_name", "Unknown Institution")

    if not files:
        return jsonify({"error": "No files selected"}), 400

    uploaded_files = []
    failed_files = []

    safe_institution_name = re.sub(r"[^\w\s-]", "", institution_name)
    safe_institution_name = re.sub(r"[-\s]+", "_", safe_institution_name)

    files_folder = os.path.join(upload_folder, "files", safe_institution_name)
    os.makedirs(files_folder, exist_ok=True)

    now = datetime.now()
    upload_date = now.strftime("%Y%m%d")
    upload_time = now.strftime("%H%M%S")
    batch_id = f"{upload_date}_{upload_time}"

    for file in files:
        if file and file.filename:
            if allowed_file_func(file.filename):
                try:
                    original_filename = secure_filename(file.filename)
                    name_without_ext, file_extension = os.path.splitext(original_filename)

                    new_filename = (
                        f"{safe_institution_name}_{upload_date}_{upload_time}_"
                        f"{name_without_ext}{file_extension}"
                    )

                    file_path = os.path.join(files_folder, new_filename)
                    file.save(file_path)

                    file_size = os.path.getsize(file_path)
                    file_extension_type = (
                        file_extension[1:].lower() if file_extension else "unknown"
                    )

                    file_metadata = {
                        "id": f"{batch_id}_{new_filename}",
                        "batch_id": batch_id,
                        "institution_id": institution_id,
                        "institution_name": institution_name,
                        "original_filename": file.filename,
                        "saved_filename": new_filename,
                        "file_path": file_path,
                        "file_size": file_size,
                        "file_type": file_extension_type,
                        "upload_date": upload_date,
                        "upload_time": upload_time,
                        "uploaded_at": now.isoformat(),
                        "status": "uploaded",
                        "processed": False,
                    }

                    save_metadata_func(file_metadata)

                    uploaded_files.append(
                        {
                            "original_filename": file.filename,
                            "saved_filename": new_filename,
                            "file_path": file_path,
                            "size": file_size,
                            "type": file_extension_type,
                            "status": "success",
                            "preview_url": f"/api/files/preview/{safe_institution_name}/{new_filename}",
                        }
                    )

                    file_metadata["needs_processing"] = True

                except Exception as e:  # pragma: no cover - logging only
                    failed_files.append({"filename": file.filename, "error": str(e)})
            else:
                failed_files.append(
                    {"filename": file.filename, "error": "File type not allowed"}
                )

    extracted_data = []
    if uploaded_files:
        try:
            from ocr_pipeline import process_certificate_file, normalize_extracted_data, create_certificate_hash

            for file_info in uploaded_files:
                file_path = file_info["file_path"]
                print(f"Extracting data from: {file_path}")
                data = process_certificate_file(file_path)
                data = normalize_extracted_data(data)

                if "blockchain_hash" not in data:
                    data["blockchain_hash"] = create_certificate_hash(data)
        
                data["preview_url"] = file_info["preview_url"]
                data["original_filename"] = file_info["original_filename"]
                extracted_data.append(data)
        except Exception as e:  # pragma: no cover - logging only
            print(f"Extraction error: {str(e)}")
            return (
                jsonify(
                    {"success": False, "error": f"Data extraction failed: {str(e)}"}
                ),
                500,
            )

    return (
        jsonify(
            {
                "success": True,
                "batch_id": batch_id,
                "uploaded": len(uploaded_files),
                "failed": len(failed_files),
                "files": uploaded_files,
                "failed_files": failed_files,
                "extracted_data": extracted_data,
                "institution_name": institution_name,
                "message": (
                    f"Successfully uploaded {len(uploaded_files)} file(s). "
                    "Please review and confirm."
                ),
            }
        ),
        200,
    )


def get_uploads_handler(get_all_metadata_func):
    """Return grouped upload batches for an institution (if specified)."""
    institution_id = request.args.get("institution_id")

    metadata = get_all_metadata_func()

    if institution_id:
        metadata = [m for m in metadata if m.get("institution_id") == institution_id]

    batches = {}
    for item in metadata:
        batch_id = item.get("batch_id")
        if batch_id not in batches:
            batches[batch_id] = {
                "batch_id": batch_id,
                "institution_name": item.get("institution_name"),
                "uploaded_at": item.get("uploaded_at"),
                "files": [],
                "total_files": 0,
                "processed_files": 0,
            }
        batches[batch_id]["files"].append(item)
        batches[batch_id]["total_files"] += 1
        if item.get("processed"):
            batches[batch_id]["processed_files"] += 1

    return (
        jsonify(
            {
                "success": True,
                "batches": list(batches.values()),
                "total_batches": len(batches),
            }
        ),
        200,
    )


def preview_file_handler(institution_name, filename, upload_folder):
    """Serve uploaded files for preview."""
    try:
        file_path = os.path.join(upload_folder, "files", institution_name, filename)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        return send_file(file_path, as_attachment=False)

    except Exception as e:  # pragma: no cover - logging only
        return jsonify({"error": str(e)}), 500


try:
    # Import the blockchain service from the same backend directory
    from blockchain_service import register_hashes_on_blockchain
except ImportError as e:
    # Fallback for development/testing if the blockchain service is not set up
    print(
        f"WARNING: Could not import blockchain_service (register_hashes_on_blockchain): {e}. "
        "Hashes will be SKIPPED."
    )

    def register_hashes_on_blockchain(hashes):
        """Fallback: mark all hashes as SKIPPED instead of raising."""
        return [
            {"hash": hash_val, "status": "SKIPPED", "tx_hash": "N/A"}
            for hash_val in hashes
        ]
# --- END CRITICAL IMPORTS ---


def confirm_and_save_data_handler():
    """
    Confirm extracted data: persist to Supabase `official_records` table and
    register hashes on the blockchain (non-blocking – status returned as PENDING).
    """
    data = request.get_json() or {}

    extracted_data = data.get("extracted_data", [])
    institution_name = data.get("institution_name", "Unknown Institution")

    if not extracted_data:
        return jsonify({"error": "No data to save"}), 400

    hashes_for_blockchain = []
    # NOTE: hashes are (re)generated inside the Supabase loop below using the
    # canonical formula: name + student_id + semester + cgpa.
    # This pre-pass just validates that the incoming items have the minimum
    # required fields so we can fail-fast before any DB/blockchain work.
    for item in extracted_data:
        if not item.get("student_id"):
            print(f"[WARNING] Skipping record with no student_id: {item.get('original_filename')}")

    # (hashes_for_blockchain list is populated after canonical hash generation below)

    try:
        # --- 1. SUPABASE INSERT ---
        supabase = _get_supabase()
        inserted_count = 0
        insert_errors = []

        if supabase:
            for item in extracted_data:
                # --- Regenerate canonical hash: name + student_id + semester + cgpa ---
                name   = str(item.get("student_name", "") or "").lower().strip()
                s_id   = str(item.get("student_id",   "") or "").lower().strip()
                sem    = str(item.get("semester",      "") or "").lower().strip()
                cgpa   = str(item.get("cgpa",          "") or "").lower().strip()

                canonical_string = f"{name}{s_id}{sem}{cgpa}"
                raw_hash = hashlib.sha256(canonical_string.encode("utf-8")).hexdigest()
                blockchain_hash = f"0x{raw_hash}"

                # Back-fill the item so the blockchain submission list is consistent
                item["blockchain_hash"] = blockchain_hash

                record = {
                    "institution_name": institution_name,
                    "student_name":     item.get("student_name", ""),
                    "student_id":       item.get("student_id",   ""),
                    "course_name":      item.get("course_name",  ""),
                    "degree_type":      item.get("degree_type",  ""),
                    "cgpa":             str(item.get("cgpa", "")),
                    "year_of_passing":  str(item.get("year_of_passing", "")),
                    "semester":         str(item.get("semester", "")),
                    "subject_grades":   item.get("subject_grades", []),
                    "blockchain_hash":  blockchain_hash,
                    "issuing_authority": item.get("issuing_authority", ""),
                }
                try:
                    supabase.table("official_records").insert(record).execute()
                    inserted_count += 1
                    print(f"[SUPABASE] Inserted record for student: {record['student_id']} "
                          f"semester: {record['semester']} hash: {blockchain_hash[:12]}…")
                except Exception as db_err:
                    err_msg = str(db_err)
                    print(f"[SUPABASE] Insert error for {record.get('student_id')}: {err_msg}")
                    insert_errors.append({"student_id": record.get("student_id"), "error": err_msg})
        else:
            print("[SUPABASE] Client not available – skipping DB insert.")

        # Collect freshly-generated hashes for blockchain submission
        hashes_for_blockchain = [
            item["blockchain_hash"]
            for item in extracted_data
            if item.get("blockchain_hash", "").startswith("0x") and len(item["blockchain_hash"]) == 66
        ]

        if not hashes_for_blockchain:
            return jsonify({
                "success": False,
                "error": "No valid blockchain hashes generated – check OCR extraction."
            }), 400

        # --- 2. BLOCKCHAIN REGISTRATION (non-blocking) ---
        print(f"[BLOCKCHAIN] Submitting {len(hashes_for_blockchain)} hashes to Sepolia...")
        blockchain_results = register_hashes_on_blockchain(hashes_for_blockchain)

        successful_registrations = sum(
            1 for res in blockchain_results if res["status"] in ("SUCCESS", "PENDING")
        )
        print(
            f"[BLOCKCHAIN SUMMARY] Submitted {successful_registrations} of "
            f"{len(hashes_for_blockchain)} hashes."
        )

        return (
            jsonify(
                {
                    "success": True,
                    "total_records": len(extracted_data),
                    "supabase_inserted": inserted_count,
                    "supabase_errors": insert_errors,
                    "hashes_submitted": hashes_for_blockchain,
                    "blockchain_status": (
                        "SUCCESS"
                        if successful_registrations == len(hashes_for_blockchain)
                        else "PARTIAL_FAILURE"
                    ),
                    "blockchain_registrations": blockchain_results,
                    "registered_count": successful_registrations,
                    "message": (
                        f"Saved {inserted_count} record(s) to Supabase and submitted "
                        f"{successful_registrations} hash(es) to Sepolia (status: PENDING)."
                    ),
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Save and Blockchain error: {str(e)}")
        traceback.print_exc()
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Failed to save data or register hashes: {str(e)}",
                }
            ),
            500,
        )