import hashlib
import secrets
from flask import Flask, jsonify
from flask import current_app
from db import users_col
from bson.objectid import ObjectId

class User:
    @staticmethod
    def hash_password(password, salt=None):
        if salt is None:
            salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return password_hash, salt
    
    @staticmethod
    def verify_password(password, stored_hash, salt):
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return password_hash == stored_hash

    @staticmethod
    def signup(username, email, password, possible_dates, profile, program, degree):
        allowed_domains = ["@torontomu.ca", "@mail.utoronto.ca", "@uwo.ca", "@my.yorku.ca"]

        #2. Convert to lowercase and check
        email_lower = email.lower()

        #make it so email is universty domain only liek torontomu.ca
        school = None
        if email_lower.endswith("@torontomu.ca"):
            school = "TMU"
        elif email_lower.endswith("@mail.utoronto.ca"):
            school = "UofT"
        elif email_lower.endswith("@uwo.ca"):
            school = "Western"
        elif email_lower.endswith("@my.yorku.ca"):
            school = "York"
        else:
            return {"error": "Invalid university email"}, 400


        if not school:
            return {"error": "Only TMU, UofT, York and Western emails are allowed"}, 400

        #Check if username already exists
        existing_user = users_col.find_one({"username": username})
        if existing_user:
            return {"error": "Username already exists"}, 400
        
        #Check if email already exists
        existing_email = users_col.find_one({"email": email})
        if existing_email:
            return {"error": "Email already exists"}, 400
        
        #Hashes password
        password_hash, salt = User.hash_password(password)

        #maybe add avatar/profile pic later


        user_school = profile.get("school", school)
        user = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "salt": salt,
            "possible_dates": possible_dates,
            
            "profile": {
                "school": user_school,
                "degree": degree,
                "program": program,
                "#ofratings": 0,
                "rating": 0
            }

            
        }
        result = users_col.insert_one(user)
        return {"message": "User created successfully"}, 200

    @staticmethod
    def login(data):
        email = data.get("email", "")  # normalize email
        password = data.get("password", "")

        if not email or not password:
            return {"error": "Email and password required"}, 400

        # find user by normalized email
        user = users_col.find_one({"email": email})
        if not user:
            return {"error": "Invalid credentials"}, 401

        # verify password
        input_hash, _ = User.hash_password(password, user["salt"])
        if input_hash == user["password_hash"]:
            # Remove sensitive data before returning
            user_data = {
                "user_id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "profile": user.get("profile", {}),
                "possible_dates": user.get("possible_dates", [])
            }

            return user_data, 200
        else:
            return {"error": "Invalid credentials"}, 401

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by user_id"""
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                # Return user data without sensitive information
                user_data = {
                    "user_id": str(user["_id"]),
                    "username": user.get("username"),
                    "email": user.get("email"),
                    "profile": user.get("profile", {}),
                    "possible_dates": user.get("possible_dates", [])
                }
                return user_data
            return None
        except Exception as e:
            print(f"Error getting user by id: {str(e)}")
            return None

#need update profile
