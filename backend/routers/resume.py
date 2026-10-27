from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from core import db, current_user
from nlp import analyze, extract_text

router = APIRouter(tags=["resume"])

@router.post("/resume/analyze")
async def analyze_resume(job_id: int = Form(...), file: UploadFile = File(...), u=Depends(current_user)):
    data = await file.read()
    if len(data) > 5_000_000:
        raise HTTPException(413, "File too large (max 5 MB)")
    job = await db.jobs.find_one({"jid": job_id})
    if not job:
        raise HTTPException(404, "Job not found")
    try:
        text = extract_text(file.filename or "", data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception:
        raise HTTPException(400, "Could not read this file")
    if len(text.strip()) < 30:
        raise HTTPException(400, "No readable text found (scanned PDF?)")
    res = analyze(text, job)
    res["job_id"] = job_id
    await db.users.update_one({"_id": u["_id"]}, {"$set": {"last_analysis": res}})
    return res
