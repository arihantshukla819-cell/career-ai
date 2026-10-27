import io, re
from docx import Document
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def extract_text(filename: str, data: bytes) -> str:
    n = filename.lower()
    if n.endswith(".pdf"):
        return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)
    if n.endswith(".docx"):
        return "\n".join(p.text for p in Document(io.BytesIO(data)).paragraphs)
    raise ValueError("Only PDF and DOCX files are supported")

def has_skill(text: str, skill: str) -> bool:
    return re.search(r"(?<![a-z0-9])" + re.escape(skill.lower()) + r"(?![a-z0-9])", text.lower()) is not None

def analyze(text: str, job: dict) -> dict:
    matched = [s for s in job["skills"] if has_skill(text, s)]
    missing = [s for s in job["skills"] if s not in matched]
    coverage = len(matched) / max(len(job["skills"]), 1)
    jd = " ".join([job["title"], job["desc"], " ".join(job["skills"])])
    try:
        m = TfidfVectorizer(stop_words="english").fit_transform([text, jd])
        sim = float(cosine_similarity(m[0], m[1])[0][0])
    except ValueError:
        sim = 0.0
    score = round(100 * (0.7 * coverage + 0.3 * sim))  # keyword coverage + TF-IDF similarity
    tips = [f"Add evidence of {s} (project, course or experience) if you have it." for s in missing]
    return {"score": score, "matched": matched, "missing": missing, "similarity": round(sim, 3), "tips": tips}
