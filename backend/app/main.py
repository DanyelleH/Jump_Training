#Bootstrap employee management system backend
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config.database import client, employees_collection
from app.routes.employee_router import router as employee_router
# Importing the context manager for lifespan events startup and shutdown code

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    try:
        info = client.server_info()  # Attempt to connect to MongoDB
        #Initialize database connection or other resources here
        print("Starting up the Employee Management System API...")
        yield
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        #Handle connection error, e.g., by logging or raising an exception to prevent the app from starting
        yield
    yield
    # Shutdown code
    print("Shutting down the Employee Management System API...")


# # Insert into empoyee collection
# employees_collection.insert_one({
#     "employee_id": "EMP001",
#     "name": "John Doe",
#     "email":"john.doe@example.com",
#     "position": "Software Engineer",
#     "department": "Engineering",
#     "salary": 90000,
#     "status": "Active",
#     "created_at": "2024-06-01T10:00:00Z",
# })

app=FastAPI(title="Employee Management System API", version="1.0", lifespan=lifespan)

# Include employee router
app.include_router(employee_router, prefix="/employees", tags=["Employees"])

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "API is healthy"}