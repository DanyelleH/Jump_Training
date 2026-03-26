from app.model.user_model import create_user, get_user_by_username, add_activity
from app.util.utils import hash_password, verify_password, create_access_token
from fastapi import HTTPException

def register_user(user, db):
    existing = get_user_by_username(db, user.username)

    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    user_dict["activitylog"] = []

    create_user(db, user_dict)

    add_activity(db, user.username, "User registered")

    return {"msg": "User created successfully"}

def login_user(username: str, password: str, db):
    user = get_user_by_username(db, username)

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "username": user["username"],
        "role": user["role"]
    })

    add_activity(db, username, "User logged in")

    return {"access_token": token, "token_type": "bearer"}