#Bootstrap employee management system backend
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config.database import client, employees_collection
from app.routes.employee_routes import router as employee_router
import app.routes.user_routes as user_router
# Importing the context manager for lifespan events startup and shutdown code

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        client.server_info()  # test connection
        print("Starting up the Employee Management System API...")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e

    yield

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


from fastapi.middleware.cors import CORSMiddleware
# Add CORS middleware to allow requests from frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173", "http://localhost:5174"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include employee router
app.include_router(employee_router, prefix="/employees", tags=["Employees"])
app.include_router(user_router.router, prefix="/auth")

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "API is healthy"}