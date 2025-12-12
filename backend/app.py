import os
import json
import hashlib
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from pathlib import Path
from ocr_pipeline import verify_certificate


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        
        existing_data.append(metadata)
        
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving metadata: {str(e)}")


def get_all_metadata():
    """Retrieve all upload metadata"""
    try:
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
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


@app.route("/api/institution/upload-certificates", methods=["POST"])
def upload_certificates():
    """Handle bulk certificate uploads from institutions"""
    if 'files[]' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('files[]')
    institution_id = request.form.get('institution_id', 'unknown')
    institution_name = request.form.get('institution_name', 'Unknown Institution')
    
    if not files:
        return jsonify({"error": "No files selected"}), 400

    uploaded_files = []
    failed_files = []
    
    # Create institution-specific subfolder
    institution_folder = os.path.join(UPLOAD_FOLDER, secure_filename(institution_id))
    os.makedirs(institution_folder, exist_ok=True)
    
    # Create timestamp-based batch folder
    batch_id = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    batch_folder = os.path.join(institution_folder, batch_id)
    os.makedirs(batch_folder, exist_ok=True)

    for file in files:
        if file and file.filename:
            if allowed_file(file.filename):
                try:
                    # Secure the filename
                    filename = secure_filename(file.filename)
                    
                    # Save the file
                    file_path = os.path.join(batch_folder, filename)
                    file.save(file_path)
                    
                    # Get file info
                    file_size = os.path.getsize(file_path)
                    file_extension = filename.rsplit('.', 1)[1].lower()
                    
                    # Prepare metadata
                    file_metadata = {
                        'id': f"{batch_id}_{filename}",
                        'batch_id': batch_id,
                        'institution_id': institution_id,
                        'institution_name': institution_name,
                        'filename': filename,
                        'file_path': file_path,
                        'file_size': file_size,
                        'file_type': file_extension,
                        'uploaded_at': datetime.utcnow().isoformat(),
                        'status': 'uploaded',
                        'processed': False
                    }
                    
                    # Save metadata
                    save_metadata(file_metadata)
                    
                    uploaded_files.append({
                        'filename': filename,
                        'size': file_size,
                        'type': file_extension,
                        'status': 'success'
                    })
                    
                except Exception as e:
                    failed_files.append({
                        'filename': file.filename,
                        'error': str(e)
                    })
            else:
                failed_files.append({
                    'filename': file.filename,
                    'error': 'File type not allowed'
                })

    return jsonify({
        'success': True,
        'batch_id': batch_id,
        'uploaded': len(uploaded_files),
        'failed': len(failed_files),
        'files': uploaded_files,
        'failed_files': failed_files,
        'message': f'Successfully uploaded {len(uploaded_files)} file(s)'
    }), 200


@app.route("/api/institution/uploads", methods=["GET"])
def get_uploads():
    """Get all uploaded files metadata"""
    institution_id = request.args.get('institution_id')
    
    metadata = get_all_metadata()
    
    # Filter by institution if provided
    if institution_id:
        metadata = [m for m in metadata if m.get('institution_id') == institution_id]
    
    # Group by batch
    batches = {}
    for item in metadata:
        batch_id = item.get('batch_id')
        if batch_id not in batches:
            batches[batch_id] = {
                'batch_id': batch_id,
                'institution_name': item.get('institution_name'),
                'uploaded_at': item.get('uploaded_at'),
                'files': [],
                'total_files': 0,
                'processed_files': 0
            }
        batches[batch_id]['files'].append(item)
        batches[batch_id]['total_files'] += 1
        if item.get('processed'):
            batches[batch_id]['processed_files'] += 1
    
    return jsonify({
        'success': True,
        'batches': list(batches.values()),
        'total_batches': len(batches)
    }), 200


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
    """Handle institution signin - verifies email, password, and hash key"""
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    data = request.get_json() or {}
    
    # Validate required fields
    required_fields = ['email', 'password', 'hashKey']
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
                "contactPersonName": institution.get('contact_person_name'),
                "verified": institution.get('verified', False),
                "createdAt": institution.get('created_at')
            }
        }), 200
            
    except Exception as e:
        print(f"Institution signin error: {str(e)}")
        return jsonify({"error": f"Sign in failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


# Endpoint: certificate verification using OCR + HOG templates
@app.route("/api/verify/certificate", methods=["POST"])
def verify_certificate_route():
    if not supabase:
        return jsonify({"error": "Database not configured"}), 503

    # Expecting multipart/form-data with file field 'file' and optionally 'studentId'
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    uploads_dir = Path(__file__).parent / 'uploads'
    uploads_dir.mkdir(parents=True, exist_ok=True)

    filename = secure_filename(file.filename)
    # ensure unique
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    save_path = uploads_dir / unique_name
    file.save(str(save_path))

    try:
        result = verify_certificate(str(save_path), templates_dir=str(Path(__file__).parent / 'ocr_templates'))
    except Exception as e:
        print('Verification error:', str(e))
        return jsonify({"error": "Verification failed", "detail": str(e)}), 500

    return jsonify({"success": True, "result": result}), 200