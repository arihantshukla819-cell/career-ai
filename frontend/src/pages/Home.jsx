import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { JobCard, Skeleton, Err } from "../components.jsx";

const CATS = ["Data & Analytics", "Web Development", "AI / ML", "Backend", "Design", "Product"];

export default function Home() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/jobs?limit=3").then(setJobs).catch((e) => setErr(e.message)); }, []);
  const search = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    nav(`/jobs?q=${encodeURIComponent(f.get("q"))}&location=${encodeURIComponent(f.get("loc"))}`);
  };
  return (
    <>
      <section className="hero">
        <div>
          <h1>Your Next Career Move Starts Here.</h1>
          <p>Discover relevant jobs, improve your resume with AI, identify skill gaps, and prepare for interviews—all in one place.</p>
          <form className="sb" onSubmit={search} role="search">
            <input name="q" placeholder="Job title or skill" aria-label="Job title or skill" />
            <input name="loc" placeholder="Location" aria-label="Location" />
            <button className="btn g">Search</button>
          </form>
          <div className="row">
            <Link className="btn light" to="/jobs">Explore Jobs</Link>
            <Link className="btn light" to="/analyzer">Analyze My Resume</Link>
          </div>
        </div>
        <svg viewBox="0 0 240 200" role="img" aria-label="Career growth illustration">
          <rect x="20" y="130" width="40" height="50" rx="8" fill="#fff" opacity=".5" /><rect x="80" y="100" width="40" height="80" rx="8" fill="#fff" opacity=".7" />
          <rect x="140" y="60" width="40" height="120" rx="8" fill="#fff" />
          <path d="M30 110 L100 80 L160 40 L200 20" stroke="#FF7A59" strokeWidth="6" fill="none" strokeLinecap="round" /><circle cx="200" cy="20" r="10" fill="#FF7A59" />
          <circle cx="60" cy="40" r="14" fill="#06B6D4" /><text x="60" y="45" fontSize="14" textAnchor="middle" fill="#fff" fontWeight="800">AI</text>
        </svg>
      </section>
      <h2>Featured jobs</h2>
      <Err>{err}</Err>
      {!jobs && !err ? <Skeleton /> : <div className="grid">{jobs?.map((j) => <JobCard key={j.jid} job={j} />)}</div>}
      <h2>Popular categories</h2>
      <div className="row">{CATS.map((c, i) => <Link key={c} to={`/jobs?q=${encodeURIComponent(c.split(" ")[0])}`} className={`badge b${i % 5} big`}>{c}</Link>)}</div>
      <h2>How CareerAI works</h2>
      <div className="grid steps">
        {[["Create a profile", "Sign up and save roles you like."], ["Analyze your resume", "Compare it with a job."], ["Close skill gaps", "See what to learn next."], ["Track applications", "Move jobs from saved to offer."]].map(([t, d]) => <div className="card" key={t}><b>{t}</b><p className="mu">{d}</p></div>)}
      </div>
      <h2>AI features</h2>
      <div className="grid">
        <div className="card"><b>🎯 Match score</b><p className="mu">TF-IDF similarity plus skill coverage.</p></div>
        <div className="card"><b>🧩 Skill-gap finder</b><p className="mu">Highlights missing skills for each role.</p></div>
        <div className="card"><b>🎤 Interview practice</b><p className="mu">Planned feature.</p></div>
      </div>
    </>
  );
}
