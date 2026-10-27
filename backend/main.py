import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core import db
from jobs_data import SAMPLE_JOBS
from routers import auth, jobs, resume

@asynccontextmanager
async def lifespan(app):
    await db.users.create_index("email", unique=True)
    await db.jobs.create_index("jid", unique=True)
    if await db.jobs.count_documents({}) == 0:
        await db.jobs.insert_many([dict(j) for j in SAMPLE_JOBS])
    yield

app = FastAPI(title="CareerAI API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
                   allow_methods=["*"], allow_headers=["*"])
for r in (auth.router, jobs.router, resume.router):
    app.include_router(r)

@app.get("/health")
async def health():
    return {"ok": True}
