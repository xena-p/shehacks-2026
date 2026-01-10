from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from db import items_col
import uuid
from .models import Item

item_bp = Blueprint('item', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#works
@item_bp.route("/items", methods=["POST"])
def create_item():
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    condition = request.form.get("condition")
    location = request.form.get("location")
    user_id = request.form.get("user_id")  # send from frontend if needed
    required_fields = ["user_id", "title", "description", "category", "condition"]
    
    if not all(field in request.form for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    images = []
    

    item_data = {
        "title": title,
        "description": description,
        "category": category,
        "condition": condition,
        "location": location,
        "images": images
    }
    if "images" in request.files:
        files = request.files.getlist("images")
        for file in files:
            filename = secure_filename(file.filename)
            path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(path)
            item_data["images"].append(path)  # or URL if you serve static files
    

    response, status_code = Item.create_item(user_id, item_data)
    return jsonify(response), status_code
    

@item_bp.route("/items/upload-image", methods=["POST"])
def upload_image():
    """Upload an image for an item"""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    if file and allowed_file(file.filename):
        # Create uploads directory if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(filepath)
        
        # Return the file URL (you might want to serve this through Flask or use a CDN)
        image_url = f"/uploads/{unique_filename}"
        return jsonify({"message": "Image uploaded successfully", "image_url": image_url}), 200
    
    return jsonify({"error": "Invalid file type"}), 400

@item_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(UPLOAD_FOLDER, filename)


#works
#get OTHER user items
@item_bp.route("/items", methods=["GET"])
def get_items_for_browsing():
    """Get items for browsing"""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    items, status_code = Item.get_items_for_browsing(user_id, exclude_user=True)
    return jsonify({"items": items}), status_code

#works
@item_bp.route("/items/user/<user_id>", methods=["GET"])
def get_user_items(user_id):
    """Get items posted by a specific user"""
    items, status_code = Item.get_user_items(user_id)
    return jsonify({"items": items}), status_code