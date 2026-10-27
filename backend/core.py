import os, datetime as dt
import bcrypt, jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
JWT_SECRET = os.environ["JWT_SECRET"]  # never hard-code secrets
db = AsyncIOMotorClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))[os.getenv("DB_NAME", "careerai")]
bearer = HTTPBearer(auto_error=False)

def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def check_pw(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())

def make_token(uid: str) -> str:
    exp = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=12)
    return jwt.encode({"sub": uid, "exp": exp}, JWT_SECRET, algorithm="HS256")

async def current_user(c: HTTPAuthorizationCredentials = Depends(bearer)):
    if not c:
        raise HTTPException(401, "Not authenticated")
    try:
        uid = jwt.decode(c.credentials, JWT_SECRET, algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.users.find_one({"_id": ObjectId(uid)})
    if not user:
        raise HTTPException(401, "User not found")
    return user

def clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc
