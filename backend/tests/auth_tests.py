import pytest
from datetime import datetime, timedelta, timezone
import importlib.metadata
from app.main import app
from app.util.utils import create_access_token, hash_password

# ---------------------------
# Helper Functions
# ---------------------------

@pytest.fixture
def create_user(test_db):
    def _create_user(username="testuser", password="StrongPass123!", role="user"):
        user = {
            "username": username,
            "email": f"{username}@test.com",
            "password": hash_password(password),
            "role": role,
        }
        test_db.users.insert_one(user)
        return user

    return _create_user


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


def test_register_duplicate_username_returns_409(client, create_user):
    create_user(username="dupuser")

    response = client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup@test.com",
        "password": "StrongPass123!",
        "role": "user"
    })

    assert response.status_code == 409

def test_login_success_returns_jwt(client, create_user):
    create_user(username="loginuser")

    response = client.post("/auth/login", json={
        "username": "loginuser",
        "password": "StrongPass123!"
    })

    assert response.status_code == 200

    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client, create_user):
    create_user(username="user1", password="CorrectPass123!")

    response = client.post("/auth/login", json={
        "username": "user1",
        "password": "WrongPass"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"



def test_login_nonexistent_user_returns_401(client):
    response = client.post("/auth/login", json={
        "username": "nouser",
        "password": "whatever"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"



def test_admin_route_with_user_role_returns_403(client, create_user):
    create_user(username="normaluser", role="user")

    token = create_access_token({
        "username": "normaluser",
        "role": "user"
    })

    response = client.get(
        "/auth/admin-dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403