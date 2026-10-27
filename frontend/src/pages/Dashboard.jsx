import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { JobCard, Skeleton, Err } from "../components.jsx";

const STAGES = ["Saved", "Applied", "Interview", "Offer"];

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/me/dashboard").then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <Err>{err}</Err>;
  if (!d) return <Skeleton n={3} />;
  const a = d.analysis;
  const chart = STAGES.map((s) => ({ stage: s, count: d.app_counts[s] || 0 }));
  const total = Object.values(d.app_counts).reduce((x, y) => x + y, 0);
  return (
    <>
      <h1>Welcome back, {d.name} 👋</h1>
      <div className="grid">
        <div className="card"><div className="mu">Resume match</div><div className="kpi">{a ? a.score + "%" : "—"}</div>{!a && <span className="mu">Analyze a resume to see this.</span>}</div>
        <div className="card"><div className="mu">Saved jobs</div><div className="kpi">{d.saved.length}</div></div>
        <div className="card"><div className="mu">Applications tracked</div><div className="kpi">{total}</div></div>
      </div>
      <h2>Application activity</h2>
      <div className="card" style={{ height: 240 }}>
        <ResponsiveContainer><BarChart data={chart}><XAxis dataKey="stage" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#5B5FEF" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      </div>
      <h2>Recommended jobs</h2>
      <div className="grid">{d.recommended.map((j) => <JobCard key={j.jid} job={j} />)}</div>
      <h2>Saved jobs</h2>
      {d.saved.length ? <div className="grid">{d.saved.map((j) => <JobCard key={j.jid} job={j} />)}</div> : <div className="card center">⭐ Nothing saved yet.</div>}
      <h2>Skill progress</h2>
      <div className="card">
        {a ? [...a.matched.map((s) => [s, 100]), ...a.missing.map((s) => [s, 0])].map(([s, v]) => <div key={s}>{s}<div className="bar"><i style={{ width: v + "%" }} /></div></div>) : <span className="mu">Run the analyzer to track skills.</span>}
      </div>
      <h2>Weekly roadmap <small className="mu">(demo content)</small></h2>
      <div className="card"><ol><li>Mon–Tue: learn the top missing skill</li><li>Wed: build a small project</li><li>Thu: update your resume</li><li>Fri: apply to 3 roles</li></ol></div>
      <h2>Interview practice</h2>
      <div className="card center mu">🎤 No sessions yet. This feature is planned.</div>
    </>
  );
}
