from app.util import utils
import pytest
from fastapi.testclient import TestClient
from app.main import app
from pymongo import MongoClient
from httpx import AsyncClient
from app.config.database import get_db
from app.util.utils import get_current_user
import asyncio

# client = TestClient(app)

TEST_DB_NAME = "test_db"
MONGO_TEST_URI = "mongodb://localhost:27017/"  # Update if your MongoDB URI is different

def pytest_addoption(parser):
    parser.addoption("--employee-id", action="store", default="EMP100")
    parser.addoption("--department", action="store", default="IT")


@pytest.fixture
def employee_id(request):
    return request.config.getoption("--employee-id")


@pytest.fixture
def department(request):
    return request.config.getoption("--department")

#Reusable fixtures for creation/ deletion of employees in test cases to avoid code duplication and ensure clean state for each test
@pytest.fixture
def employee_payload(employee_id, department):
    return {
        "employee_id": employee_id,
        "name": "Test User",
        "email": f"{employee_id.lower()}@example.com",
        "position": "Developer",
        "department": department,
        "salary": 90000,
        "status": "Active",
    }


@pytest.fixture
def create_employee(client, employee_payload, mock_admin_user):  # ✅ ADD THIS
    client.delete(f"/employees/{employee_payload['employee_id']}")

    response = client.post("/employees", json=employee_payload)
    assert response.status_code in [200, 201]

    yield employee_payload

    client.delete(f"/employees/{employee_payload['employee_id']}")

@pytest.fixture
def client(test_db):
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mongo_client():
    client = MongoClient(MONGO_TEST_URI)
    yield client
    client.close()

# Testing db
@pytest.fixture(scope="function")
def test_db(mongo_client):
    db = mongo_client[TEST_DB_NAME]

    # Clean DB before each test
    db.users.delete_many({})

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    yield db

    # ✅ teardown MUST be directly after yield
    db.users.delete_many({})
    app.dependency_overrides.clear()

# @pytest.fixture(scope="session")
# def event_loop():
#     loop = asyncio.new_event_loop()
#     yield loop
#     loop.close()


@pytest.fixture
def mock_admin_user():
    def override():
        return {"username": "admin", "role": "admin"}

    app.dependency_overrides[utils.get_current_user] = override
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_normal_user():
    def override():
        return {"username": "testuser", "role": "user"}

    app.dependency_overrides[get_current_user] = override
    yield
    app.dependency_overrides.clear()

