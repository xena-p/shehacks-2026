from flask import Blueprint, request, jsonify
from db import users_col
from user.models import User

from . import user_bp

@user_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        possible_dates = data.get("possible_dates", [])
        profile = data.get("profile", {})
        program = data.get("program", "")
        degree = data.get("degree", "")
        
        if not username or not email or not password:
            return jsonify({"error": "Missing username, email, or password"}), 400

        result, status_code = User.signup(username, email, password, possible_dates, profile, program, degree)
        return jsonify(result), status_code
    except Exception as e:
        print(f"Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}  # safer than request.json
    result, status = User.login(data)  # use your User class login method
    return jsonify(result), status

@user_bp.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):
    user = User.get_user_by_id(user_id)
    if user:
        return jsonify(user), 200
    else:
        return jsonify({"error": "User not found"}), 404
