# SAMPLE records only: not real vacancies. Replace with an authorized job API.
def J(jid, title, company, location, mode, typ, exp, sal, skills, days, desc):
    return dict(jid=jid, title=title, company=company, location=location, mode=mode, type=typ, exp=exp,
                salary_lpa=sal, skills=skills, posted_days_ago=days, desc=desc, sample=True, apply_url=None)

SAMPLE_JOBS = [
    J(1, "Data Analyst", "Sample Corp A", "Bengaluru", "Hybrid", "Full-time", "Fresher", 6, ["SQL", "Excel", "Power BI", "Python"], 3, "Analyze business data, build dashboards and report insights to stakeholders."),
    J(2, "Full Stack Developer Intern", "Sample Labs", "Remote", "Remote", "Internship", "Fresher", None, ["React", "Node.js", "MongoDB", "JavaScript"], 1, "Build web features across React frontend and API backend."),
    J(3, "Python Backend Developer", "Sample Systems", "Noida", "On-site", "Full-time", "1-3 yrs", 9, ["Python", "FastAPI", "MongoDB", "Docker"], 5, "Design REST APIs and data models for a SaaS product."),
    J(4, "Business Intelligence Analyst", "Sample Retail Co", "Delhi", "Hybrid", "Full-time", "1-3 yrs", 8, ["Power BI", "SQL", "Excel", "Statistics"], 2, "Create BI reports on retail demand and stock levels."),
    J(5, "Machine Learning Engineer", "Sample AI Works", "Hyderabad", "On-site", "Full-time", "3+ yrs", 18, ["Python", "scikit-learn", "NLP", "TensorFlow"], 7, "Train and deploy NLP models to production."),
    J(6, "Frontend Developer", "Sample Studio", "Remote", "Remote", "Contract", "1-3 yrs", 10, ["React", "CSS", "JavaScript", "Tailwind"], 4, "Build accessible, responsive user interfaces."),
    J(7, "Data Science Intern", "Sample Analytics", "Pune", "Hybrid", "Internship", "Fresher", None, ["Python", "Pandas", "Statistics", "SQL"], 6, "Support modelling and exploratory analysis."),
    J(8, "Junior Data Analyst", "Sample Finance", "Gurugram", "On-site", "Full-time", "Fresher", 5, ["Excel", "SQL", "Tableau", "Communication"], 2, "Prepare reports and clean datasets for the finance team."),
]
