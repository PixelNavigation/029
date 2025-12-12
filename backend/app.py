import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv


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


@app.route("/profiles", methods=["GET"])
def list_profiles():
    if not supabase:
        return jsonify({"error": "Supabase not configured"}), 503

    try:
        response = supabase.table("profiles").select("*").limit(10).execute()
        return jsonify({"data": response.data}), 200
    except Exception as exc:  # pragma: no cover - passthrough error
        return jsonify({"error": str(exc)}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email:
        return jsonify({"error": "email required"}), 400

    # If Supabase is configured, try to fetch the profile
    if supabase:
        try:
            resp = supabase.table('profiles').select('*').eq('email', email).limit(1).execute()
            profile = resp.data[0] if resp.data and len(resp.data) > 0 else None
            if profile:
                # For demo: no real password check. Return profile as user.
                user = {
                    'id': profile.get('id') or profile.get('email'),
                    'email': profile.get('email'),
                    'role': profile.get('role') or role or 'student',
                    'name': profile.get('name') or profile.get('email').split('@')[0],
                    'profile': profile
                }
                return jsonify({'user': user}), 200
        except Exception as exc:
            return jsonify({'error': str(exc)}), 500

    # Fallback mock behavior
    mock_user = {
        'id': f"mock-{email}",
        'email': email,
        'role': role or ('admin' if email.endswith('@admin') else ('institution' if ('@edu' in email) or ('@university' in email) else 'student')),
        'name': email.split('@')[0]
    }
    return jsonify({'user': mock_user}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)