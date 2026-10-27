import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from core import db, clean, current_user

router = APIRouter(tags=["jobs"])
STATUSES = {"Saved", "Applied", "Interview", "Offer", "Rejected"}

@router.get("/jobs")
async def list_jobs(q: Optional[str] = None, location: Optional[str] = None, mode: Optional[str] = None,
                    type: Optional[str] = None, exp: Optional[str] = None, min_salary: Optional[float] = None,
                    sort: str = Query("date", pattern="^(date|salary|relevance)$"), limit: int = Query(50, le=100)):
    f: dict = {}
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        f["$or"] = [{"title": rx}, {"company": rx}, {"skills": rx}]
    if location: f["location"] = {"$regex": re.escape(location), "$options": "i"}
    if mode: f["mode"] = mode
    if type: f["type"] = type
    if exp: f["exp"] = exp
    if min_salary: f["salary_lpa"] = {"$gte": min_salary}
    jobs = [clean(j) async for j in db.jobs.find(f)]
    if sort == "salary":
        jobs.sort(key=lambda j: j["salary_lpa"] or 0, reverse=True)
    elif sort == "relevance" and q:
        jobs.sort(key=lambda j: sum(q.lower() in s.lower() for s in j["skills"]), reverse=True)
    else:
        jobs.sort(key=lambda j: j["posted_days_ago"])
    return jobs[:limit]

@router.get("/jobs/{jid}")
async def get_job(jid: int):
    j = await db.jobs.find_one({"jid": jid})
    if not j: raise HTTPException(404, "Job not found")
    return clean(j)

@router.post("/jobs/{jid}/save")
async def toggle_save(jid: int, u=Depends(current_user)):
    add = jid not in u.get("saved", [])
    await db.users.update_one({"_id": u["_id"]}, {"$addToSet" if add else "$pull": {"saved": jid}})
    return {"saved": add}

class Status(BaseModel):
    status: str

@router.put("/applications/{jid}")
async def set_status(jid: int, b: Status, u=Depends(current_user)):
    if b.status == "":
        await db.users.update_one({"_id": u["_id"]}, {"$unset": {f"apps.{jid}": ""}})
    elif b.status in STATUSES:
        await db.users.update_one({"_id": u["_id"]}, {"$set": {f"apps.{jid}": b.status}})
    else:
        raise HTTPException(400, "Invalid status")
    return {"ok": True}

@router.get("/me/dashboard")
async def dashboard(u=Depends(current_user)):
    saved = [clean(j) async for j in db.jobs.find({"jid": {"$in": u.get("saved", [])}})]
    counts: dict = {}
    for s in u.get("apps", {}).values():
        counts[s] = counts.get(s, 0) + 1
    last = u.get("last_analysis")
    have = {s.lower() for s in (last or {}).get("matched", [])}
    all_jobs = [clean(j) async for j in db.jobs.find({})]
    rec = [j for j in all_jobs if have & {s.lower() for s in j["skills"]}] or all_jobs
    return {"name": u["name"], "saved": saved, "app_counts": counts, "analysis": last, "recommended": rec[:3]}
