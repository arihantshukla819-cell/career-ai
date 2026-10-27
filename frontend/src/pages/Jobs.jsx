import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { Badges, JobCard, Skeleton, Err } from "../components.jsx";
import { useAuth } from "../App.jsx";

export function Jobs() {
  const [sp, setSp] = useSearchParams();
  const [jobs, setJobs] = useState(null);
  const [err, setErr] = useState("");
  const qs = sp.toString();
  useEffect(() => { setJobs(null); setErr(""); api("/jobs?" + qs).then(setJobs).catch((e) => setErr(e.message)); }, [qs]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  const F = ({ k, label, opts }) => (
    <select aria-label={label} value={sp.get(k) || ""} onChange={(e) => set(k, e.target.value)}>
      <option value="">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  return (
    <>
      <h1>Find jobs</h1>
      <div className="note">These are sample records, not real vacancies. Connect an authorized job API for live listings.</div>
      <div className="filters">
        <input aria-label="Search" placeholder="Title, company or skill" value={sp.get("q") || ""} onChange={(e) => set("q", e.target.value)} />
        <input aria-label="Location" placeholder="Location" value={sp.get("location") || ""} onChange={(e) => set("location", e.target.value)} />
        <F k="mode" label="Work mode" opts={["Remote", "Hybrid", "On-site"]} />
        <F k="type" label="Job type" opts={["Full-time", "Internship", "Contract"]} />
        <F k="exp" label="Experience" opts={["Fresher", "1-3 yrs", "3+ yrs"]} />
        <input aria-label="Minimum salary (LPA)" type="number" min="0" placeholder="Min LPA" style={{ width: 110 }} value={sp.get("min_salary") || ""} onChange={(e) => set("min_salary", e.target.value)} />
        <select aria-label="Sort" value={sp.get("sort") || "date"} onChange={(e) => set("sort", e.target.value)}>
          <option value="date">Newest</option><option value="salary">Salary</option><option value="relevance">Relevance</option>
        </select>
      </div>
      <Err>{err}</Err>
      {!jobs && !err && <Skeleton n={6} />}
      {jobs && (jobs.length ? <div className="grid">{jobs.map((j) => <JobCard key={j.jid} job={j} />)}</div> : <div className="card center">🔍 No jobs match these filters.</div>)}
    </>
  );
}

export function JobDetail() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const [job, setJob] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/jobs/${id}`).then(setJob).catch((e) => setErr(e.message)); }, [id]);
  const setStatus = async (status) => { await api(`/applications/${id}`, { method: "PUT", body: { status } }); refresh(); };
  if (err) return <Err>{err}</Err>;
  if (!job) return <Skeleton n={1} />;
  return (
    <>
      <Link to="/jobs" className="mu">← Back</Link>
      <div className="card" style={{ marginTop: 10 }}>
        <h1>{job.title}</h1>
        <p className="mu">{job.company} · {job.location} · {job.mode} · {job.type}</p>
        <p>{job.desc}</p><p><Badges items={job.skills} /></p>
        {job.sample && <div className="note">Sample record. No real application link exists for it.</div>}
        {job.apply_url && <a className="btn g" href={job.apply_url} target="_blank" rel="noreferrer noopener">Apply</a>}
        {user ? (
          <label>Application status{" "}
            <select value={user.apps[id] || ""} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Not tracked</option>{["Saved", "Applied", "Interview", "Offer", "Rejected"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        ) : <p className="mu"><Link to="/login">Log in</Link> to track this application.</p>}
      </div>
    </>
  );
}
