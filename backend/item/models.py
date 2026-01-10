from bson.objectid import ObjectId
from db import items_col, users_col

#create method for creating a list of items that are similar/most useful

class Item:
    #works
    @staticmethod
    def create_item(user_id, item_data):
        """Create a new item"""
        user = users_col.find_one({"_id": ObjectId(user_id)})
        user_program = user.get("profile", {}).get("program", "Unknown")
        try:
            item = {
                "user_id": ObjectId(user_id),
                "title": item_data.get("title"),
                "description": item_data.get("description"),
                "condition": item_data.get("condition"),
                "category": item_data.get("category"),
                "requester": " ", # no requester at creation
                "program": user_program, #optional
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
        
    @staticmethod
    def request_item(item_id, requester_id):
        #When a user likes/requests an item, mark it unavailable and set them as requester
        try:
            #1.Attempt to update the item ONLY if it is currently 'available'
            result = items_col.update_one(
                {
                    "_id": ObjectId(item_id), 
                    "status": "available" # Safety check: prevents double-booking
                },
                {
                    "$set": {
                        "status": "unavailable",
                        "requester": ObjectId(requester_id)
                    }
                }
            )

            #2. Check if the update actually happened
            if result.modified_count == 0:
                #This means either the ID was wrong or status wasn't 'available'
                return {"error": "Item is no longer available or does not exist"}, 400

            return {"message": "Item requested successfully. You are now the requester!"}, 200

        except Exception as e:
            return {"error": f"Failed to request item: {str(e)}"}, 400