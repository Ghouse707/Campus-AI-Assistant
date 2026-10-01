from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"  # default role

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(request: RegisterRequest):
    role = request.role.lower().strip()
    if role not in ("user", "admin"):
        role = "user"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (request.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        
        hashed = hash_password(request.password)
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (request.name.strip(), request.email.lower().strip(), hashed, role)
        )
        user_id = cursor.lastrowid

    token = create_access_token({"sub": str(user_id), "role": role, "email": request.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": request.name.strip(),
            "email": request.email.lower().strip(),
            "role": role
        }
    }

@router.post("/login")
def login(request: LoginRequest):
    email = request.email.lower().strip()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, email, password, role FROM users WHERE email = ?",
            (email,)
        )
        user = cursor.fetchone()
        if not user or not verify_password(request.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
        
        token = create_access_token({"sub": str(user["id"]), "role": user["role"], "email": user["email"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
