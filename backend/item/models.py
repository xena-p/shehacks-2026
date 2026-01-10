from bson.objectid import ObjectId
from db import items_col, users_col

class Item:
    #works
    @staticmethod
    def create_item(user_id, item_data):
        """Create a new item"""
        try:
            item = {
                "user_id": ObjectId(user_id),
                "title": item_data.get("title"),
                "description": item_data.get("description"),
                "condition": item_data.get("condition"),
                "images": item_data.get("images", []),
                "status": "available"  # available, exchanged, removed
            }
            result = items_col.insert_one(item)
            return {"message": "Item created successfully", "item_id": str(result.inserted_id)}, 200
        except Exception as e:
            return {"error": f"Failed to create item: {str(e)}"}, 400
        
    