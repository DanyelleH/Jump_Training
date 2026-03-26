from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ActivityLog(BaseModel):
    action: str
    timestamp: datetime

class User(BaseModel):
    username: str
    email: EmailStr
    role: str = "user"

class UserCreate(User):
    password: str

class UserResponse(User):
    id: str
    activitylog: List[ActivityLog] = []