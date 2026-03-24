import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

#Test cases for the GET /employees endpoint to list all employees
def test_get_employees():
    response = client.get("/employees")
    print(response.json())  # Print the response for debugging
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test case for adding a new employee (this would require a POST endpoint to be implemented in the future)
def test_add_employee():
    response = client.delete("/employees/EMP005")
    #employee being added to the database for testing purposes
    payload = {
        "employee_id": "EMP005",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Product Manager",
        "department": "Product",

        "status": "Active",
        "salary": 95000,
    }

    response = client.post("/employees", json=payload)
    assert response.status_code == 201
    assert response.json().get("message") == "Employee added successfully"
    # Add logic ro remove the test employee from the database after the test completes.
    response = client.delete("/employees/EMP005")
    assert response.status_code == 200


# Test case for deleting an employee (employees/{employee_id})
def test_delete_employee():
    # First, add an employee to ensure there is one to delete
    payload = {
        "employee_id": "EMP006",
        "name": "Mark Smith",
    }
    client.post("/employees", json=payload)
    # Now, delete the employee
    response = client.delete("/employees/EMP006")
    assert response.status_code == 200

# Test case for updating an employee (employees/{employee_id})
def test_update_employee():
    client.delete("/employees/EMP007")
    # First, add an employee to ensure there is one to update
    payload = {
        "employee_id": "EMP007",
        "name": "Emily Davis",
        "email": "emily.davis@example.com",
        "position": "Developer",
        "department": "IT",
        "salary": 90000,
        "status": "Active",
        "created_at": "2024-06-01T10:00:00Z"
    }
    client.post("/employees", json=payload)
    # Now, update the employee's information
    update_payload = {
        "name": "Emily Davis Updated",
        "email": "emily.davis.updated@example.com"
    }

    response = client.put("/employees/EMP007", json=update_payload)
    assert response.status_code == 200
    assert response.json().get("message") == "Employee updated successfully"
    # Clean up by deleting the test employee
    response = client.delete("/employees/EMP007")




# Get an employee by ID test case (employee/{employeeID})
def test_get_employee_by_id():
    client.delete("/employees/EMP008")
    # First, add an employee to ensure there is one to retrieve
    payload = {
        "employee_id": "EMP008",
        "name": "Michael Brown",
        "email": "michael.brown@example.com",
        "position": "Developer",
        "department": "IT",
        "salary": 90000,
        "status": "Active",
        "created_at": "2024-06-01T10:00:00Z"
    }

    client.post("/employees", json=payload)
    # Now, retrieve the employee by ID
    response = client.get("/employees/EMP008")
    assert response.status_code == 200
    assert response.json().get("employee_id") == "EMP008"
    # Clean up by deleting the test employee
    response = client.delete("/employees/EMP008")
    assert response.status_code == 200

# Get an employee by department test case (employees/department/{department_name}))
def test_get_employees_by_department():
    client.delete("/employees/EMP009")
    client.delete("/employees/EMP010")
    # First, add employees to ensure there are some to retrieve
    payload1 = {
        "employee_id": "EMP009",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "position": "Developer",
        "department": "IT",
        "salary": 90000,
        "status": "Active",
        "created_at": "2024-06-01T10:00:00Z"
    }
    payload2 = {
        "employee_id": "EMP010",
        "name": "Bob Williams",
        "email": "bob.williams@example.com",
        "position": "Developer",
        "department": "IT",
        "salary": 90000,
        "status": "Active",
        "created_at": "2024-06-01T10:00:00Z"
    }
    client.post("/employees", json=payload1)
    client.post("/employees", json=payload2)
    # Now, retrieve employees by department
    response = client.get("/employees/department/IT")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 2
    # Clean up by deleting the test employees
    client.delete("/employees/EMP009")
    client.delete("/employees/EMP010")
