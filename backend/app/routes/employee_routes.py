from fastapi import APIRouter, Depends
from app.controller.employee_controller import create_employee, fetch_all_employees, remove_employee, update_employee, access_employee, get_employees_by_department
from app.schema.employee_schema import Employee, EmployeeCreation

import datetime

from app.util.utils import role_required

router = APIRouter()

#GET endpoint to list all employees
@router.get("/", response_model=list[Employee], status_code=200,dependencies=[Depends(role_required(["admin", "user"]))])
def get_employees():
    return fetch_all_employees()


# POST to host/employees/employees ( set response model to dictionary instead of EmployeeCreation model)( added status code 201 for successful creation)
@router.post("/", response_model=dict,status_code=201,dependencies=[Depends(role_required(["admin"]))])
def add_employee(employee: EmployeeCreation):
    return create_employee(employee)

#DELETE endpoint to remove an employee by ID
@router.delete("/{employee_id}", response_model=dict,dependencies=[Depends(role_required(["admin"]))])
def delete_employee(employee_id: str):
    return remove_employee(employee_id)

#PUT endpoint to update an employee's information by ID
@router.put("/{employee_id}", response_model=dict,dependencies=[Depends(role_required(["admin"]))])
def update_employee_by_id(employee_id: str, update_data: dict):
    return update_employee(employee_id, update_data)

#GET endpoint to retrieve an employee by ID 
@router.get("/{employee_id}", response_model=Employee,dependencies=[Depends(role_required(["admin", "user"]))])
def get_employee(employee_id: str):
    return access_employee(employee_id)

#GET employees by department 
@router.get("/department/{department_name}", response_model=list[Employee])
def employees_in_department(department_name: str):
    return get_employees_by_department(department_name)
