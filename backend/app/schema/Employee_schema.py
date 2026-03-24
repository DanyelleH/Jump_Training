# Define Employee Scehma for data validation and serialization
from pydantic import BaseModel, EmailStr
import datetime

class Employee(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str
    created_at: str

class EmployeeResponse(Employee):
    id: str
    created_at: datetime.datetime




class EmployeeCreation(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str
    created_at: datetime.datetime = datetime.datetime.now()