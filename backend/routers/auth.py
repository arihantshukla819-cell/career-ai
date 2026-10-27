from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from core import db, hash_pw, check_pw, make_token, current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class Register(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("name")
    @classmethod
    def name_ok(cls, v):
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("password")
    @classmethod
    def pw_ok(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class Login(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=201)
async def register(b: Register):
    if b.password != b.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    email = b.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(409, "Email already registered")
    r = await db.users.insert_one({"name": b.name, "email": email, "password_hash": hash_pw(b.password), "saved": [], "apps": {}})
    return {"token": make_token(str(r.inserted_id))}

@router.post("/login")
async def login(b: Login):
    u = await db.users.find_one({"email": b.email.lower()})
    if not u or not check_pw(b.password, u["password_hash"]):
        raise HTTPException(401, "Incorrect email or password")
    return {"token": make_token(str(u["_id"]))}

@router.get("/me")
async def me(u=Depends(current_user)):
    return {"name": u["name"], "email": u["email"], "saved": u.get("saved", []), "apps": u.get("apps", {})}
