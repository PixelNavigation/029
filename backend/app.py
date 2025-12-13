import os
import json
import hashlib
import uuid
import re
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from pathlib import Path
from verify_handler import (
    verify_certificate_upload as verify_certificate_upload_handler,
    calculate_match_percentage_excel,
)
from ocr_pipeline import process_certificate_file, normalize_extracted_data, create_certificate_hash

# Blockchain verification for student uploads (reuses same service as verification flow)
try:
    from blockchain_service import verify_hash_on_blockchain
except ImportError as e:
    print(
        f"WARNING: Cannot import verify_hash_on_blockchain for student uploads: {e}. "
        "Student uploads will skip blockchain checks."
    )

    def verify_hash_on_blockchain(_hash: str) -> bool:  # type: ignore[override]
        return False
from institution_handler import (
    upload_certificates_handler,
    get_uploads_handler,
    preview_file_handler,
    confirm_and_save_data_handler,
)


load_dotenv()

app = Flask(__name__)

# Explicitly allow local dev and devtunnel frontends
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "https://0cqvrx6t-5173.inc1.devtunnels.ms",
    "https://0cqvrx6t-5000.inc1.devtunnels.ms",
]

CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# File upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp', 'doc', 'docx', 'xls', 'xlsx', 'csv'}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  #100MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create metadata file path
METADATA_FILE = os.path.join(UPLOAD_FOLDER, 'uploads_metadata.json')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_metadata(metadata):
    """Save upload metadata to JSON file"""
    try:
        existing_data = []
        if os.path.exists(METADATA_FILE) and os.path.getsize(METADATA_FILE) > 0:
            try:
                with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = []
        
        existing_data.append(metadata)
        
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving metadata: {str(e)}")


def get_all_metadata():
    """Retrieve all upload metadata"""
    try:
        if os.path.exists(METADATA_FILE) and os.path.getsize(METADATA_FILE) > 0:
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except json.JSONDecodeError:
        print(f"Error reading metadata: Invalid JSON")
        return []
    except Exception as e:
        print(f"Error reading metadata: {str(e)}")
        return []


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase = None

if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "supabase_configured": bool(supabase),
    })


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    """Handle student signup - creates account in Supabase"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    data = request.get_json() or {}
    
    # Validate required fields
    # Secure fields required to be stored in secure table
    required_fields = ['email', 'password', 'studentId', 'phone']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Check if user already exists (by email) in secure table
        existing_user = supabase.table('students').select('*').eq('email', data['email']).execute()
        if existing_user.data and len(existing_user.data) > 0:
            return jsonify({"error": "User with this email already exists. Please sign in."}), 409

        # Check if student ID already exists in secure table
        existing_student_id = supabase.table('students').select('*').eq('student_id', data['studentId']).execute()
        if existing_student_id.data and len(existing_student_id.data) > 0:
            return jsonify({"error": "Student ID already exists"}), 409

        # Insert secure record into students table (only secure data)
        secure_student = {
            'email': data['email'],
            'password': data['password'],  # In production, hash this!
            'student_id': data['studentId'],
            'phone': data['phone'],
            'role': 'student',
            'verified': False,
            'created_at': datetime.utcnow().isoformat()
        }

        result_secure = supabase.table('students').insert(secure_student).execute()
        if not (result_secure.data and len(result_secure.data) > 0):
            return jsonify({"error": "Failed to create secure account record"}), 500

        # Insert public profile data into public_profiles table (non-sensitive)
        public_profile = {
            'student_id': data['studentId'],
            'name': data.get('name', ''),
            'university': data.get('university', ''),
            'course': data.get('course', ''),
            'year': data.get('year', ''),
            'profile_photo': data.get('profilePhoto', ''),
            'social_links': data.get('socialLinks', {}),
            'bio': data.get('bio', '')
        }

        result_public = supabase.table('public_profiles').insert(public_profile).execute()

        return jsonify({
            "success": True,
            "message": "Account created successfully! Please sign in with your credentials."
        }), 201
            
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@app.route("/api/upload-profile-photo", methods=["POST"])
def upload_profile_photo():
    """Upload profile photo to Supabase Storage"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    if 'photo' not in request.files:
        return jsonify({"error": "No photo file provided"}), 400

    file = request.files['photo']
    student_id = request.form.get('studentId')

    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        try:
            # Generate unique filename
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"profile_photos/{student_id}_{uuid.uuid4().hex}.{file_ext}"
            
            # Read file content
            file_content = file.read()
            
            # Upload to Supabase Storage using correct Python API
            try:
                # The Python Supabase library expects bytes and path
                storage = supabase.storage.from_('student-profiles')
                
                # Upload file
                res = storage.upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type": f"image/{file_ext}"}
                )
                
                print(f"Upload successful: {unique_filename}")
                
            except Exception as upload_err:
                print(f"Supabase upload error: {str(upload_err)}")
                print(f"Error type: {type(upload_err).__name__}")
                import traceback
                traceback.print_exc()
                
                # Try alternative upload method
                try:
                    res = storage.upload(path=unique_filename, file=file_content)
                    print("Upload succeeded with basic method")
                except Exception as retry_err:
                    print(f"Retry also failed: {str(retry_err)}")
                    raise
            
            # Get public URL
            public_url = supabase.storage.from_('student-profiles').get_public_url(unique_filename)
            print(f"Public URL: {public_url}")
            
            return jsonify({
                "success": True,
                "url": public_url
            }), 200

        except Exception as e:
            print(f"Upload error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Failed to upload photo: {str(e)}"}), 500
    
    return jsonify({"error": "Invalid file type"}), 400


@app.route("/api/auth/signin", methods=["POST"])
def signin():
    """Handle student signin - authenticates user"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Fetch student from database
        result = supabase.table('students').select('*').eq('email', email).execute()
        if not result.data or len(result.data) == 0:
            return jsonify({"error": "Invalid email or password"}), 401

        student = result.data[0]
        # Verify password (in production, use proper password hashing comparison)
        if student.get('password') != password:
            return jsonify({"error": "Invalid email or password"}), 401

        # Fetch public profile for this student_id (if exists)
        public = supabase.table('public_profiles').select('*').eq('student_id', student.get('student_id')).maybe_single().execute()
        public_data = public.data if public and public.data else {}

        # Build response (exclude password)
        user_data = {
            'id': student.get('id'),
            'email': student.get('email'),
            'role': student.get('role', 'student'),
            'studentId': student.get('student_id'),
            'phone': student.get('phone'),
            'verified': student.get('verified', False),
            'createdAt': student.get('created_at'),
            'profile': {
                'name': public_data.get('name') if public_data else '',
                'university': public_data.get('university') if public_data else '',
                'course': public_data.get('course') if public_data else '',
                'year': public_data.get('year') if public_data else '',
                'profilePhoto': public_data.get('profile_photo') if public_data else f"https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff",
                'socialLinks': public_data.get('social_links') if public_data else {}
            }
        }

        return jsonify({
            "success": True,
            "user": user_data
        }), 200
        
    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500


@app.route("/api/student/upload-certificate", methods=["POST"])
def upload_student_certificate():
    """Upload student certificate to Supabase Storage"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    student_id = request.form.get('studentId')
    document_type = request.form.get('documentType', 'certificate')

    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        # We'll persist a temp copy for OCR + hashing, then upload to Supabase
        temp_path = None
        try:
            # Generate unique filename
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"certificates/{student_id}/{document_type}_{timestamp}_{uuid.uuid4().hex}.{file_ext}"

            # Save a temporary copy for OCR/hash calculation
            uploads_dir = Path(UPLOAD_FOLDER) / "student_verify"
            uploads_dir.mkdir(parents=True, exist_ok=True)
            safe_name = secure_filename(file.filename)
            temp_path = uploads_dir / f"{uuid.uuid4().hex}_{safe_name}"
            file.save(str(temp_path))

            # Read file content from disk for Supabase upload
            with open(temp_path, "rb") as f:
                file_content = f.read()

            # Upload to Supabase Storage using correct Python API
            try:
                storage = supabase.storage.from_('student-profiles')

                content_type = f'application/{file_ext}' if file_ext == 'pdf' else f'image/{file_ext}'
                res = storage.upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type": content_type}
                )

                print(f"Certificate upload successful: {unique_filename}")

            except Exception as upload_err:
                print(f"Supabase certificate upload error: {str(upload_err)}")
                import traceback
                traceback.print_exc()

                # Try without options
                try:
                    res = storage.upload(path=unique_filename, file=file_content)
                    print("Certificate upload succeeded with basic method")
                except Exception as retry_err:
                    print(f"Certificate retry failed: {str(retry_err)}")
                    raise

            # Get public URL
            public_url = supabase.storage.from_('student-profiles').get_public_url(unique_filename)

            # --- Blockchain-aware verification on student upload ---
            is_on_blockchain = False
            blockchain_hash = None
            try:
                extracted_data = process_certificate_file(str(temp_path))
                extracted_data = normalize_extracted_data(extracted_data)

                if not extracted_data.get("error"):
                    certificate_hash = create_certificate_hash(extracted_data)
                    blockchain_hash = certificate_hash
                    is_on_blockchain = verify_hash_on_blockchain(certificate_hash)

                    print(f"[STUDENT UPLOAD] Calculated Hash (H_OCR): {certificate_hash}")
                    print(
                        f"[STUDENT UPLOAD] Blockchain Status: "
                        f"{'VERIFIED' if is_on_blockchain else 'NOT FOUND'}"
                    )
                else:
                    print(f"[STUDENT UPLOAD] OCR error during hash calculation: {extracted_data.get('error')}")
            except Exception as verify_err:
                print(f"[STUDENT UPLOAD] Blockchain check failed: {verify_err}")

            verification_status = 'verified' if is_on_blockchain else 'pending'

            # Store certificate metadata in database
            certificate_data = {
                'student_id': student_id,
                'document_type': document_type,
                'file_name': file.filename,
                'file_url': public_url,
                'file_size': len(file_content),
                'uploaded_at': datetime.utcnow().isoformat(),
                'verification_status': verification_status,
                'blockchain_hash': blockchain_hash,
                'is_on_blockchain': is_on_blockchain,
            }

            # Insert into certificates table
            try:
                cert_result = supabase.table('certificates').insert(certificate_data).execute()
                certificate_id = cert_result.data[0]['id'] if cert_result.data else None
            except Exception as db_err:
                print(f"Database insert error: {str(db_err)}")
                # Continue even if database insert fails - at least file is uploaded
                certificate_id = None

            return jsonify({
                "success": True,
                "url": public_url,
                "certificateId": certificate_id,
                "fileName": file.filename,
                "isOnBlockchain": is_on_blockchain,
                "blockchainHash": blockchain_hash,
            }), 200

        except Exception as e:
            print(f"Upload error: {str(e)}")
            return jsonify({"error": f"Failed to upload certificate: {str(e)}"}), 500
        finally:
            # Best-effort cleanup of temporary file
            try:
                if temp_path and Path(temp_path).exists():
                    Path(temp_path).unlink()
            except Exception:
                pass
    
    return jsonify({"error": "Invalid file type"}), 400


@app.route("/api/student/certificates/<student_id>", methods=["GET"])
def get_student_certificates(student_id):
    """Get all certificates for a student.

    For now, returns hardcoded demo certificates when the Supabase table
    is not available so the public portal always has data to show.
    """

    # Hardcoded demo certificates for UI/QR flows
    demo_certificates = [
        {
            "id": 1,
            "student_id": student_id,
            "file_name": "SSC_Memo_demo.pdf",
            "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploaded_at": "2024-01-10T09:30:00Z",
            "verification_status": "verified",
        },
        {
            "id": 2,
            "student_id": student_id,
            "file_name": "Inter_Short_Memo_demo.pdf",
            "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploaded_at": "2024-02-20T11:15:00Z",
            "verification_status": "verified",
        },
    ]

    # If Supabase isn't configured, just return demo data
    if not supabase:
        return jsonify({"success": True, "certificates": demo_certificates}), 200

    try:
        result = supabase.table("certificates").select("*").eq("student_id", student_id).execute()
        data = result.data or []

        # If the table exists but no rows yet, still fall back to demos
        if not data:
            data = demo_certificates

        return jsonify({"success": True, "certificates": data}), 200

    except Exception as e:
        # If the certificates table doesn't exist yet, serve demo data instead of 500
        error_str = str(e)
        print(f"Fetch certificates error: {error_str}")
        if "public.certificates" in error_str or "PGRST205" in error_str:
            print("Certificates table missing; returning demo certificates.")
            return jsonify({"success": True, "certificates": demo_certificates}), 200

        return jsonify({"error": f"Failed to fetch certificates: {error_str}"}), 500


@app.route("/api/public_profiles/<student_id>", methods=["GET"])
def get_public_profile(student_id):
    """Get public profile for a student by student_id.

    Returns a single profile object. If no public profile exists but the student
    record is present, a minimal profile is synthesized from the students table.
    """
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    try:
        # Try to fetch from public_profiles first
        profile_result = (
            supabase
            .table("public_profiles")
            .select("*")
            .eq("student_id", student_id)
            .maybe_single()
            .execute()
        )

        profile_data = profile_result.data if profile_result and profile_result.data else None

        # If no explicit public profile, fall back to basic student record
        if not profile_data:
            student_result = (
                supabase
                .table("students")
                .select("*")
                .eq("student_id", student_id)
                .maybe_single()
                .execute()
            )

            student = student_result.data if student_result and student_result.data else None
            if not student:
                return jsonify({"error": "Profile not found"}), 404

            profile_data = {
                "student_id": student.get("student_id"),
                "name": student.get("name") or "",
                "university": "",
                "course": "",
                "year": "",
                "profile_photo": "",
                "social_links": {},
                "bio": "",
            }

        # Ensure key public fields are present; use demo defaults if missing
        profile_data["email"] = profile_data.get("email") or "babelgautam16@gmail.com"
        profile_data["course"] = profile_data.get("course") or "CSE"
        profile_data["year"] = profile_data.get("year") or "4th Year"
        profile_data["university"] = profile_data.get("university") or "Mecs"

        return jsonify(profile_data), 200

    except Exception as e:
        print(f"Public profile fetch error: {str(e)}")
        return jsonify({"error": f"Failed to fetch public profile: {str(e)}"}), 500


@app.route("/api/institution/upload-certificates", methods=["POST"])
def upload_certificates():
    """Wrapper delegating bulk upload logic to `institution_handler`."""
    return upload_certificates_handler(UPLOAD_FOLDER, allowed_file, save_metadata)


@app.route("/api/institution/uploads", methods=["GET"])
def get_uploads():
    """Wrapper delegating uploads listing logic to `institution_handler`."""
    return get_uploads_handler(get_all_metadata)


@app.route("/api/files/preview/<institution_name>/<filename>", methods=["GET"])
def preview_file(institution_name, filename):
    """Wrapper delegating preview logic to `institution_handler`."""
    return preview_file_handler(institution_name, filename, UPLOAD_FOLDER)


@app.route("/api/institution/confirm-data", methods=["POST"])
def confirm_and_save_data():
    """Wrapper delegating confirm/save logic to `institution_handler`."""
    return confirm_and_save_data_handler()


@app.route("/api/auth/institution/signup", methods=["POST"])
def institution_signup():
    """Handle institution signup - creates account in Supabase and generates SHA256 hash"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    data = request.get_json() or {}
    
    # Validate required fields
    required_fields = ['institutionName', 'institutionCode', 'email', 'password', 'website']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Check if institution already exists
        existing = supabase.table('institutions').select('*').eq('email', data['email']).execute()
        if existing.data and len(existing.data) > 0:
            return jsonify({"error": "Institution with this email already exists"}), 409
        
        existing_code = supabase.table('institutions').select('*').eq('institution_code', data['institutionCode']).execute()
        if existing_code.data and len(existing_code.data) > 0:
            return jsonify({"error": "Institution code already exists"}), 409
        
        # Generate SHA256 hash of institution data (for verification)
        hash_data = {
            'institutionName': data['institutionName'],
            'institutionCode': data['institutionCode'],
            'email': data['email'],
            'website': data['website'],
            'establishedYear': data.get('establishedYear', ''),
            'timestamp': datetime.utcnow().isoformat()
        }
        hash_string = json.dumps(hash_data, sort_keys=True)
        institution_hash = hashlib.sha256(hash_string.encode()).hexdigest()
        
        # Insert institution record
        institution_data = {
            'institution_name': data['institutionName'],
            'institution_code': data['institutionCode'],
            'email': data['email'],
            'password': data['password'],  # In production, hash this!
            'website': data['website'],
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'state': data.get('state', ''),
            'pincode': data.get('pincode', ''),
            'established_year': data.get('establishedYear', ''),
            'institution_type': data.get('institutionType', ''),
            'affiliated_board': data.get('affiliatedBoard', ''),
            'contact_person_name': data.get('contactPersonName', ''),
            'contact_person_email': data.get('contactPersonEmail', ''),
            'contact_person_phone': data.get('contactPersonPhone', ''),
            'contact_person_designation': data.get('contactPersonDesignation', ''),
            'institution_hash': institution_hash,
            'role': 'institution',
            'verified': False,
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('institutions').insert(institution_data).execute()
        if not (result.data and len(result.data) > 0):
            return jsonify({"error": "Failed to create institution account"}), 500
        
        return jsonify({
            "success": True,
            "message": "Institution registered successfully!",
            "institutionHash": institution_hash,
            "institutionCode": data['institutionCode']
        }), 201
            
    except Exception as e:
        print(f"Institution signup error: {str(e)}")
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@app.route("/api/auth/institution/signin", methods=["POST"])
def institution_signin():
    """Handle institution signin - verifies email, password, hash key, and institution type"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    data = request.get_json() or {}
    
    # Validate required fields
    required_fields = ['email', 'password', 'hashKey', 'institutionType']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Find institution by email
        result = supabase.table('institutions').select('*').eq('email', data['email']).execute()
        
        if not result.data or len(result.data) == 0:
            return jsonify({"error": "Invalid email or password"}), 401
        
        institution = result.data[0]
        
        # Verify password (In production, use proper password hashing!)
        if institution.get('password') != data['password']:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Verify institution type
        stored_institution_type = institution.get('institution_type', '')
        provided_institution_type = data.get('institutionType', '')
        
        if stored_institution_type != provided_institution_type:
            return jsonify({"error": "Institution type does not match. Please select the correct institution type."}), 401
        
        # Verify hash key
        if institution.get('institution_hash') != data['hashKey']:
            return jsonify({"error": "Error in hash key, please provide correct hash key"}), 401
        
        # Successful authentication
        return jsonify({
            "success": True,
            "message": "Sign in successful",
            "institution": {
                "id": institution.get('id'),
                "institutionName": institution.get('institution_name'),
                "institutionCode": institution.get('institution_code'),
                "email": institution.get('email'),
                "institutionType": institution.get('institution_type'),
                "contactPersonName": institution.get('contact_person_name'),
                "verified": institution.get('verified', False),
                "createdAt": institution.get('created_at')
            }
        }), 200
            
    except Exception as e:
        print(f"Institution signin error: {str(e)}")
        return jsonify({"error": f"Sign in failed: {str(e)}"}), 500


@app.route("/api/verify-upload", methods=["POST"])
def verify_certificate_upload():
    """Wrapper route that delegates verification logic to `verify_handler`.

    This keeps `app.py` slim while the heavy OCR + Excel matching logic lives
    in `verify_handler.verify_certificate_upload`.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Delegate to the shared handler, passing the helper used for Excel scoring
    return verify_certificate_upload_handler(file, calculate_match_percentage_excel)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)