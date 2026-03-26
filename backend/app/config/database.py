#database configuration file
import os
from dotenv import load_dotenv
from pymongo import MongoClient
#load environment variables from .env file
load_dotenv()

client= MongoClient(os.getenv("MONGO_URI"))
db=client[os.getenv("MONGO_DB_NAME")]

employees_collection=db["employees"]
users_collection = db["users"]

ROLES = ["admin", "user"]

def get_db():
    return db