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
    def signup(username, email, password):
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

        user = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "salt": salt
        }
