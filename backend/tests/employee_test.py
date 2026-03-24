import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_employees():
    response = client.get("/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_employee(employee_payload):
    client.delete(f"/employees/{employee_payload['employee_id']}")

    response = client.post("/employees", json=employee_payload)

    assert response.status_code == 201
    assert response.json().get("message") == "Employee added successfully"

    client.delete(f"/employees/{employee_payload['employee_id']}")

def test_delete_employee(create_employee):
    emp_id = create_employee["employee_id"]

    response = client.delete(f"/employees/{emp_id}")
    assert response.status_code == 200

def test_update_employee(create_employee):
    emp_id = create_employee["employee_id"]

    update_payload = {
        "name": "Updated Name",
        "email": "updated@example.com"
    }

    response = client.put(f"/employees/{emp_id}", json=update_payload)

    assert response.status_code == 200
    assert response.json().get("message") == "Employee updated successfully"

def test_get_employee_by_id(create_employee):
    emp_id = create_employee["employee_id"]

    response = client.get(f"/employees/{emp_id}")

    assert response.status_code == 200
    assert response.json().get("employee_id") == emp_id

def test_get_employees_by_department(create_employee, department):
    response = client.get(f"/employees/department/{department}")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(emp["department"] == department for emp in response.json())