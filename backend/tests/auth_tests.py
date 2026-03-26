import pytest
from datetime import datetime, timedelta, timezone
import importlib.metadata
from app.main import app
from app.util.utils import create_access_token, hash_password

# ---------------------------
# Helper Functions
# ---------------------------

def create_user(db, username="testuser", password="StrongPass123!", role="user"):
    user = {
        "username": username,
        "email": f"{username}@test.com",
        "password": hash_password(password),
        "role": role,
    }
    db.users.insert_one(user)
    return user


# ---------------------------
# TESTS
# ---------------------------


def test_register_user_success(client, test_db):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "new@test.com",
        "password": "StrongPass123!",
        "role": "user"
    })

    assert response.status_code == 201

    user = test_db.users.find_one({"username": "newuser"})
    assert user is not None
    assert user["password"] != "StrongPass123!"
    # ✅ Verify activity log created
    assert len(user["activitylog"]) == 1
    assert user["activitylog"][0]["action"] == "User registered"


def test_register_duplicate_username_returns_409(client, test_db):
    create_user(test_db, username="dupuser")

    response = client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup@test.com",
        "password": "StrongPass123!",
        "role": "user"
    })

    assert response.status_code == 409


def test_login_success_returns_jwt(client, test_db):
    create_user(test_db, username="loginuser", password="StrongPass123!")

    response = client.post("/auth/login", data={
        "username": "loginuser",
        "password": "StrongPass123!"
    })

    assert response.status_code == 200
    body = response.json()

    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client, test_db):
    create_user(test_db, username="user1", password="CorrectPass123!")

    response = client.post("/auth/login", data={
        "username": "user1",
        "password": "WrongPass"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"



def test_login_nonexistent_user_returns_401(client):
    response = client.post("/auth/login", data={
        "username": "nouser",
        "password": "whatever"
    })


    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"



def test_admin_route_with_user_role_returns_403(client, test_db):
    create_user(test_db, username="normaluser", role="user")

    token = create_access_token({
        "username": "normaluser",
        "role": "user"
    })

    response = client.get(
        "/auth/admin-dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403