import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


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
def create_employee(employee_payload):
    # setup
    client.delete(f"/employees/{employee_payload['employee_id']}")
    response = client.post("/employees", json=employee_payload)
    assert response.status_code in [200, 201]

    yield employee_payload  # <-- test runs here

    # teardown
    client.delete(f"/employees/{employee_payload['employee_id']}")