import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { api } from "./api.js";
import { useAuth } from "./App.jsx";

export const Badges = ({ items }) => items.map((s, i) => <span key={s} className={`badge b${i % 5}`}>{s}</span>);
export const Skeleton = ({ n = 3 }) => <div className="grid">{Array.from({ length: n }, (_, i) => <div key={i} className="sk" />)}</div>;
export const Err = ({ children }) => children ? <div className="err" role="alert">{children}</div> : null;
const COLORS = ["#5B5FEF", "#8B5CF6", "#06B6D4", "#10B981", "#FF7A59"];

export function JobCard({ job }) {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const saved = user?.saved.includes(job.jid);
  const toggle = async () => {
    if (!user) return nav("/login");
    await api(`/jobs/${job.jid}/save`, { method: "POST" });
    refresh();
  };
  return (
    <article className="card">
      <div className="row">
        <div className="ini" style={{ background: COLORS[job.jid % 5] }}>{job.company.split(" ").pop()[0]}</div>
        <div><b><Link to={`/jobs/${job.jid}`}>{job.title}</Link></b><div className="mu">{job.company} · {job.location}</div></div>
      </div>
      <p><Badges items={job.skills} /></p>
      <p className="mu">{job.mode} · {job.type} · {job.exp} · {job.salary_lpa ? `₹${job.salary_lpa} LPA` : "Salary not listed"}</p>
      {job.sample && <p className="mu"><small>Sample record</small></p>}
      <div className="row">
        <button className="btn o" onClick={toggle} aria-pressed={!!saved}><Star size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button>
        <Link className="btn g" to={`/jobs/${job.jid}`}>Details</Link>
      </div>
    </article>
  );
}
