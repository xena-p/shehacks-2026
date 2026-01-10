#username: xenap26_db_user

import pymongo 
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_PASS = os.environ.get("MONGO_PASS")


if not MONGO_PASS:
    raise ValueError("MONGOPASS environment variable is not set.")

#Xenas uri
uri = f"mongodb+srv://xenap26_db_user:{MONGO_PASS}@cluster0.uzopuha.mongodb.net/?appName=cluster0"

cluster = pymongo.MongoClient(uri)
db = cluster["Data"]

users_col = db["user"]
items_col = db["item"]