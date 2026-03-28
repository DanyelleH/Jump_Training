import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_get_employees(client, mock_normal_user):
    response = client.get("/employees")

    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_employee(client, mock_admin_user, employee_payload):
    response = client.post("/employees", json=employee_payload)

    assert response.status_code == 201
    assert response.json().get("message") == "Employee added successfully"

def test_add_employee_forbidden(client, mock_normal_user, employee_payload):
    response = client.post("/employees", json=employee_payload)

    assert response.status_code == 403

def test_delete_employee(client, mock_admin_user, create_employee):
    emp_id = create_employee["employee_id"]

    response = client.delete(f"/employees/{emp_id}")

    assert response.status_code == 200

def test_delete_employee(client, mock_admin_user, create_employee):
    emp_id = create_employee["employee_id"]

    response = client.delete(f"/employees/{emp_id}")

    assert response.status_code == 200

def test_update_employee(client, mock_admin_user, create_employee):
    emp_id = create_employee["employee_id"]

    update_payload = {
        "name": "Updated Name",
        "email": "updated@example.com"
    }

    response = client.put(f"/employees/{emp_id}", json=update_payload)

    assert response.status_code == 200
    assert response.json().get("message") == "Employee updated successfully"

def test_get_employee_by_id(client, mock_normal_user, create_employee):
    emp_id = create_employee["employee_id"]

    response = client.get(f"/employees/{emp_id}")

    assert response.status_code == 200
    assert response.json()["employee_id"] == emp_id

def test_get_employees_by_department(client, create_employee, department):
    response = client.get(f"/employees/department/{department}")

    assert response.status_code == 200
    assert isinstance(response.json(), list)