import pymongo 
from pymongo import MongoClient
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
#from user.routes import user_bp 
#from item.routes import item_bp

from flask import Blueprint

app = Flask(__name__)
CORS(app)

#app.register_blueprint(user_bp)
#app.register_blueprint(item_bp)
main_bp = Blueprint('main', __name__)


@main_bp.route("/")
def home():
    return "MongoDB + Flask API is running!"

app.register_blueprint(main_bp)


if __name__ == "__main__":
    app.run(debug=True, port=8000)