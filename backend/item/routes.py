from datetime import datetime
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
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    condition = request.form.get("condition")
    return_date = request.form.get("return_date")

    try:
        # This handles strings like "2026-04-12T10:00" or "2026-04-12"
        return_date_obj = datetime.fromisoformat(return_date)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DDTHH:MM"}), 400
    
    #location = request.form.get("location")
    user_id = request.form.get("user_id")  # send from frontend if needed
    required_fields = ["user_id", "title", "description", "category", "condition", "return_date"]
    
    if not all(field in request.form for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    images = []
    

    item_data = {
        "title": title,
        "description": description,
        "category": category,
        "condition": condition,
        "return_date": return_date_obj,
        #"location": location,
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


@item_bp.route("/search", methods=["GET"])
def get_items_for_search():
    """Get items for users search"""
    user_id = request.args.get("user_id")
    user_input=request.args.get("query")

    if not user_id:
        return jsonify({"error": "User ID required"}), 401

    if not user_input:
        return jsonify({"error": "Object Name required"}), 400
    
    
    items = Item.get_user_query(user_input,user_id)
    for item in items:
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])

    return jsonify({"items": items}),200

@item_bp.route('/items/<item_id>/request', methods=['POST'])
def handle_request_item(item_id):
    #1. Get the requester_id from the JSON body
    data = request.get_json()
    
    if not data or 'requester_id' not in data:
        return jsonify({"error": "Missing requester_id in request body"}), 400
    
    requester_id = data['requester_id']

    #2. Call your static method
    #Note: If requester_id comes from a logged-in session, use that instead
    response, status_code = Item.request_item(item_id, requester_id)

    #3. Return the result
    return jsonify(response), status_code

@item_bp.route('/my_requests/<requester_id>', methods=['GET'])
def get_user_requests(requester_id):
    # Call the static method from your class
    # Replace 'Item' with your actual class name
    response, status_code = Item.get_active_requests(requester_id)
    
    return jsonify(response), status_code

@item_bp.route("/items/loaned/<user_id>", methods=["GET"])
def get_loaned_items(user_id):
    """
    Returns items owned by the user that are currently 
    marked 'unavailable' (loaned out) and have not expired.
    """
    # 1. Validation: Ensure the ID is a valid 24-character hex string for MongoDB
    if len(user_id) != 24:
        return jsonify({"error": "Invalid User ID format"}), 400

    # 2. Call the static method from your Item model
    # (Assuming your class is named Item)
    response, status_code = Item.get_my_loaned_items(user_id)

    # 3. Return the JSON response and the status code
    return jsonify(response), status_code

@item_bp.route("/items/activity/<requester_id>", methods=["GET"])
def get_activity(requester_id):
    """Route to see what I'm borrowing and what I need to rate."""
    response, status_code = Item.get_user_activity(requester_id)
    return jsonify(response), status_code

@item_bp.route("/items/rate/<item_id>", methods=["POST"])
def rate_owner(item_id):
    """Route to submit a rating and close the loan."""
    data = request.get_json()
    rating = data.get("rating")

    if not rating or not (1 <= rating <= 5):
        return jsonify({"error": "Valid rating (1-5) required"}), 400

    response, status_code = Item.complete_and_rate_owner(item_id, rating)
    return jsonify(response), status_code