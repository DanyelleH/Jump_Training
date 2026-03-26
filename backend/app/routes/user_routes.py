from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.controller.user_controller import register_user, login_user
from app.schema.user_schema import UserCreate
from app.util.utils import role_required
from app.config.database import get_db

router = APIRouter()

@router.post("/register", status_code=201)
def register(user: UserCreate, db=Depends(get_db)):
    return register_user(user, db)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    return login_user(form_data.username, form_data.password, db)

#admin only route example
@router.get("/admin-dashboard")
def admin_dashboard(user=Depends(role_required(["admin"]))):
    return {"msg": f"Welcome admin {user['username']}"}

@router.delete("/delete-user/{username}")
def delete_user(username: str, user=Depends(role_required(["admin"]))):
    return {"msg": f"Admin {user['username']} deleted {username}"}