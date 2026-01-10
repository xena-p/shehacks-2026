from flask import Blueprint

# Create the blueprint
user_bp = Blueprint("user", __name__)

# Import routes so they get attached to the blueprint
from . import routes