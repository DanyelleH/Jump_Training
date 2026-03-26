from datetime import datetime

def create_user(db, user_data: dict):
    result = db.users.insert_one(user_data)
    return str(result.inserted_id)


def get_user_by_username(db, username: str):
    return db.users.find_one({"username": username})


def add_activity(db, username: str, action: str):
    db.users.update_one(
        {"username": username},   # ✅ fix bug here too
        {
            "$push": {
                "activitylog": {
                    "action": action,
                    "timestamp": datetime.now()
                }
            }
        }
    )