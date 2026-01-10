from bson.objectid import ObjectId
from db import items_col, users_col

#create method for creating a list of items that are similar/most useful

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
                "category": item_data.get("category"),
                "requester": " ", # no requester at creation
                "program": item_data.get("program"), #optional
                "images": item_data.get("images", []),
                "return_date": item_data.get("return_date"),
                "status": "available"  # available, exchanged, removed
            }
            result = items_col.insert_one(item)
            return {"message": "Item created successfully", "item_id": str(result.inserted_id)}, 200
        except Exception as e:
            return {"error": f"Failed to create item: {str(e)}"}, 400
        
    #works
    @staticmethod
    def get_items_for_browsing(user_id, exclude_user=True):
        """Get items for browsing (excluding user's own items)"""
        try: 
            query = {"status": "available"} 
            if exclude_user: 
                query["user_id"] = {"$ne": ObjectId(user_id)} 
            items = list(items_col.find(query).sort("created_at", -1)) 
            # Convert ObjectId to string and add user info 
            for item in items: 
                u_id = item["user_id"] # Get user info for each item 
                item["_id"] = str(item["_id"]) 
                item["user_id"] = str(item["user_id"]) 
                
                user = users_col.find_one({"_id": u_id}) 
                if user: 
                    item["owner"] = { 
                        "username": user.get("username"), 
                        "profile": user.get("profile", {}) 
                    } 
            return items, 200 
        except Exception as e: 
            return [], 400

    @staticmethod
    def get_user_items(user_id):
        """Get items posted by a specific user"""
        try:
            items = list(items_col.find({"user_id": ObjectId(user_id)}).sort("created_at", -1))
            for item in items:
                item["_id"] = str(item["_id"])
                item["user_id"] = str(item["user_id"])
            return items, 200
        except Exception as e:
            return [], 400