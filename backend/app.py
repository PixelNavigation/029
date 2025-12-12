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
    required_fields = ['email', 'password', 'name', 'studentId', 'university', 'course', 'year', 'aadharId', 'phone']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    try:
        # Check if user already exists
        existing_user = supabase.table('students').select('*').eq('email', data['email']).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            return jsonify({"error": "User with this email already exists. Please sign in."}), 409
        
        # Check if student ID already exists
        existing_student_id = supabase.table('students').select('*').eq('student_id', data['studentId']).execute()
        
        if existing_student_id.data and len(existing_student_id.data) > 0:
            return jsonify({"error": "Student ID already exists"}), 409
        
        # Create new student record
        student_data = {
            'email': data['email'],
            'password': data['password'],  # In production, hash this!
            'name': data['name'],
            'student_id': data['studentId'],
            'university': data['university'],
            'course': data['course'],
            'year': data['year'],
            'aadhar_id': data['aadharId'],
            'apaar_id': data.get('apaarId', ''),
            'phone': data['phone'],
            'role': 'student',
            'verified': False,
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('students').insert(student_data).execute()
        
        if result.data and len(result.data) > 0:
            return jsonify({
                "success": True,
                "message": "Account created successfully! Please sign in with your credentials."
            }), 201
        else:
            return jsonify({"error": "Failed to create account"}), 500
            
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
        
        # Return user data (exclude password)
        user_data = {
            'id': student.get('id'),
            'email': student.get('email'),
            'role': student.get('role', 'student'),
            'name': student.get('name'),
            'studentId': student.get('student_id'),
            'course': student.get('course'),
            'year': student.get('year'),
            'university': student.get('university'),
            'phone': student.get('phone'),
            'aadharId': student.get('aadhar_id'),
            'apaarId': student.get('apaar_id'),
            'verified': student.get('verified', False),
            'createdAt': student.get('created_at'),
            'profilePhoto': f"https://ui-avatars.com/api/?name={student.get('name', 'User').replace(' ', '+')}&background=3b82f6&color=fff",
            'socialLinks': {
                'linkedin': '',
                'github': '',
                'portfolio': ''
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