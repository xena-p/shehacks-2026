from bson.objectid import ObjectId
from db import items_col, users_col
from datetime import datetime
from .Priority_Queue import PriorityQueue

#create method for creating a list of items that are similar/most useful

class Item:
    #works
    @staticmethod
    def create_item(user_id, item_data):
        """Create a new item"""
        user = users_col.find_one({"_id": ObjectId(user_id)})
        user_program = user.get("profile", {}).get("program", "Unknown")
        user_school = user.get("profile", {}).get("school", "Unknown")
        try:
            item = {
                "user_id": ObjectId(user_id),
                "title": item_data.get("title"),
                "description": item_data.get("description"),
                "condition": item_data.get("condition"),
                "category": item_data.get("category"),
                "requester": " ", # no requester at creation
                "program": user_program, #optional
                "school": user_school,
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
                # Convert requester field if it exists and is an ObjectId
                if "requester" in item and item["requester"] != " " and isinstance(item["requester"], ObjectId):
                    item["requester"] = str(item["requester"])
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
        
    @staticmethod
    def get_active_requests(requester_id):
        try:
            current_time = datetime.utcnow() # Get current time in UTC
            
            # Find items where:
            # 1. Requester matches
            # 2. return_date is greater than (after) now
            query = {
                "requester": ObjectId(requester_id),
                "return_date": {"$gt": current_time}
            }
            
            cursor = items_col.find(query)
            # Convert MongoDB cursor to a list and stringify ObjectIds
            items = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                doc["requester"] = str(doc["requester"])
                if "user_id" in doc:
                    doc["user_id"] = str(doc["user_id"])
                # Format date for JSON if it exists
                if "return_date" in doc and hasattr(doc["return_date"], "isoformat"):
                    doc["return_date"] = doc["return_date"].isoformat()
                items.append(doc)
                
            return {"items": items}, 200

        except Exception as e:
            return {"error": f"Failed to fetch active requests: {str(e)}"}, 500
        

    @staticmethod
    def get_my_loaned_items(user_id):
        try:
            current_time = datetime.utcnow()
            
            # Query logic: 
            # 1. user_id matches (you are the owner)
            # 2. status is 'unavailable' (someone has requested/borrowed it)
            # 3. return_date is in the future
            query = {
                "user_id": ObjectId(user_id),
                "status": "unavailable",
                "return_date": {"$gt": current_time}
            }
            
            cursor = items_col.find(query)
            items = []
            
            for doc in cursor:
                # Convert ObjectIds to strings for JSON compatibility
                doc["_id"] = str(doc["_id"])
                doc["user_id"] = str(doc["user_id"])
                
                if "requester" in doc and doc["requester"]:
                    doc["requester"] = str(doc["requester"])
                
                # Format date to string
                if "return_date" in doc and hasattr(doc["return_date"], "isoformat"):
                    doc["return_date"] = doc["return_date"].isoformat()
                    
                items.append(doc)
                
            return {"items": items}, 200

        except Exception as e:
            return {"error": f"Failed to fetch loaned items: {str(e)}"}, 500
    
    # search feature:
    @staticmethod
    def get_user_query(user_input, user_id):
        """ignore case sen + show similar results. 
        Item priority will be based on the users profile rating and condtion
        exclude out own user id -> "$ne"""

        #"excellent", "gently used",  "fair", "poor" -> Make sure people only enter valid data terms!!
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return []
        school = user.get("profile", {}).get("school")
        query={"title": {"$regex":user_input,
                          "$options": "i"},
                          "status": "available",
                          "user_id":{"$ne": ObjectId(user_id)},
                          "school": school}

        items=list(items_col.find(query))

        "cont: priority queue info"

        cond_rank={"excellent":3, "gently used":2, "fair":1, "poor":0}
        pq=PriorityQueue()

        for item in items:
            user = users_col.find_one({"_id": item["user_id"]})
            if user:
                ranking_user = user.get("profile", {}).get("rating", 0)
                # Add owner information to item
                item["owner"] = {
                    "username": user.get("username"),
                    "profile": user.get("profile", {})
                }
            else:
                ranking_user=0
            
            cond_str = item.get("condition", "fair")
            curr_cond = cond_rank.get(cond_str, 1)

            pq_score=(ranking_user *0.5) + (curr_cond*0.25)
            
            item["_id"] = str(item["_id"])
            item["user_id"] = str(item["user_id"])

            pq.enqueue(pq_score, item)

        "now dequeue bc it has out itms known/highlighted based on highest priority"
        
        curr_items=[]
        while not pq.is_empty():
            curr_items.append(pq.dequeue())
        return curr_items
    

    @staticmethod
    def get_user_activity(requester_id):
        """Categorizes items for the borrower: Active, Needs Rating (Overdue), or History."""
        try:
            current_time = datetime.utcnow()
            # Find all items where this user is the borrower
            query = {"requester": ObjectId(requester_id)}
            cursor = items_col.find(query)
            
            active = []
            needs_rating = []
            history = []

            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                doc["user_id"] = str(doc.get("user_id", ""))
                doc["requester"] = str(doc.get("requester", ""))

                # --- THE LAZY LOGIC ---
                # Check if it's currently on loan (unavailable)
                if doc.get("status") == "unavailable":
                    # Check if the clock has run out
                    if doc["return_date"] < current_time:
                        doc["virtual_status"] = "pending_review"
                        needs_rating.append(doc)
                    else:
                        doc["virtual_status"] = "active"
                        active.append(doc)
                
                # Check if it was already completed/rated
                elif doc.get("status") == "old":
                    history.append(doc)

                # Format date for JSON
                if "return_date" in doc:
                    doc["return_date"] = doc["return_date"].isoformat()

            return {"active": active, "needs_rating": needs_rating, "history": history}, 200
        except Exception as e:
            return {"error": str(e)}, 500

    @staticmethod
    def complete_and_rate_owner(item_id, rating_value):
        """Archives the item and updates the owner's profile rating."""
        try:
            # 1. Get the item to find out who the owner (user_id) is
            item = items_col.find_one({"_id": ObjectId(item_id)})
            if not item:
                return {"error": "Item not found"}, 404
            
            owner_id = item.get("user_id")

            # 2. Update Owner Profile (Increment total stars and count)
            users_col.update_one(
                {"_id": ObjectId(owner_id)},
                {"$inc": {"rating_sum": rating_value, "rating_count": 1}}
            )

            # 3. Change status to 'old' to hide it from active lists
            items_col.update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "old"}}
            )

            return {"message": "Rating submitted successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 500