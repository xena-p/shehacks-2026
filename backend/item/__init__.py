# Item module for managing items and exchanges
from flask import Blueprint

# Create the blueprint
item_bp = Blueprint("item", __name__)

# Import routes so they get attached to the blueprint
from . import routes