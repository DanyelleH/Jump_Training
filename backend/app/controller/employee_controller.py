# Controller function for employee related operations / business logic
from app.model.employee_model import get_all_employees
from app.schema.employee_schema import Employee ,EmployeeCreation
from app.model.employee_model import add_employee, delete_employee, get_employee_by_id, update_employee_in_db
import datetime

# GET request for all employees
def fetch_all_employees():
   employees = get_all_employees()
   for emp in employees:
       if 'created_at' in emp and isinstance(emp['created_at'], (datetime.datetime,)):
           emp['created_at'] = emp['created_at'].isoformat() + 'Z'
   return [Employee(**emp) for emp in employees]

#POST request to add new employee.
def create_employee(employee_data:EmployeeCreation):
    # conversion of Pydantic model to dictionary for database insertion
    employee_data = employee_data.model_dump()
    # Here you would add logic to insert the new employee into the database
    existing_employees = get_all_employees()
    for emp in existing_employees:
    # Check for duplicate employee_id or email before adding to the database
        if emp['employee_id'] == employee_data['employee_id']:
            raise ValueError("Employee ID already exists")
    add_employee(employee_data)
    return {"message": "Employee added successfully"}

#Delete an employee by ID
def remove_employee(employee_id: str):
    # Here you would add logic to delete the employee from the database
    if delete_employee(employee_id):
        return {"message": "Employee deleted successfully"}
    else:
        return {"message": "Employee not found"}
    

#update employee information by ID
def update_employee(employee_id: str, update_data: dict):
    existing_employee = get_employee_by_id(employee_id)
    if not existing_employee:
        raise ValueError("Employee not found")  
    # Update the employee's information with the provided data
    updated_employee_data = existing_employee.copy()  # Create a copy of the existing employee data
    updated_employee_data.update(update_data)
    update_employee_in_db(employee_id, updated_employee_data)
    # For example, you could use a function like update_employee_in_db(employee_id, updated_employee_data)
    return {"message": "Employee updated successfully"}


# access employee information by ID (for testing purposes)
def access_employee(employee_id: str):
    employee = get_employee_by_id(employee_id)
    if employee:
        if 'created_at' in employee and isinstance(employee['created_at'], (datetime.datetime,)):
            employee['created_at'] = employee['created_at'].isoformat() + 'Z'
        return Employee(**employee)
    else:
        return None
    
# Get employees by department
def get_employees_by_department(department_name: str):
    # Here you would add logic to query the database for employees in the specified department
    all_employees = fetch_all_employees()
    return [emp for emp in all_employees if emp.department.lower() == department_name.lower()]  