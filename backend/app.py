import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)