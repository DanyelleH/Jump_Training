# Query the database for employee information
from app.config.database import employees_collection
from app.schema.Employee_schema import Employee, EmployeeResponse

def get_all_employees():
    # get all fields except the MongoDB _id field
    return (list(employees_collection.find({}, {"_id": 0})))

#POST request to add a new employee
def add_employee(employee_data: dict):
    # Here you would add logic to insert the new employee into the database
    return employees_collection.insert_one(employee_data)

#DELETE request to remove an employee by ID
def delete_employee(employee_id: str):
    result = employees_collection.delete_one({"employee_id": employee_id})
    return result.deleted_count > 0  # Return True if an employee was deleted

# GET employee by ID to update
def get_employee_by_id(employee_id: str):
    employee = employees_collection.find_one({"employee_id": employee_id}, {"_id": 0})
    if employee:
        return employee
    else:
        return None
    
 #Update employee information by ID
def update_employee_in_db(employee_id: str, update_data: dict):
    result = employees_collection.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    return result.modified_count > 0