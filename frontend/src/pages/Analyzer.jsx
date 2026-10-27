import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { api } from "../api.js";
import { Badges, Err } from "../components.jsx";

export default function Analyzer() {
  const [sp] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(sp.get("job") || "1");
  const [file, setFile] = useState(null);
  const [hover, setHover] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef();
  useEffect(() => { api("/jobs").then(setJobs).catch((e) => setErr(e.message)); }, []);
  const pick = (f) => {
    if (f && !/\.(pdf|docx)$/i.test(f.name)) return setErr("Please choose a PDF or DOCX file.");
    setErr(""); setFile(f);
  };
  const run = async () => {
    if (!file) return setErr("Please upload your resume first.");
    const fd = new FormData(); fd.append("file", file); fd.append("job_id", jobId);
    setBusy(true); setErr(""); setRes(null);
    try { setRes(await api("/resume/analyze", { method: "POST", body: fd })); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <>
      <h1>AI Resume Analyzer</h1>
      <div className={`drop ${hover ? "hv" : ""}`} onDragOver={(e) => { e.preventDefault(); setHover(true); }} onDragLeave={() => setHover(false)}
        onDrop={(e) => { e.preventDefault(); setHover(false); pick(e.dataTransfer.files[0]); }}>
        <UploadCloud size={36} />
        <p><b>{file ? file.name : "Drag & drop a PDF or DOCX"}</b></p>
        <button className="btn o" onClick={() => input.current.click()}>Choose file</button>
        <input ref={input} type="file" hidden accept=".pdf,.docx" onChange={(e) => pick(e.target.files[0])} aria-label="Upload resume" />
      </div>
      <div className="f" style={{ maxWidth: "none" }}>
        <label>Target job
          <select value={jobId} onChange={(e) => setJobId(e.target.value)}>{jobs.map((j) => <option key={j.jid} value={j.jid}>{j.title} – {j.company}</option>)}</select>
        </label>
        <button className="btn g" onClick={run} disabled={busy} style={{ justifySelf: "start" }}>{busy ? "Analyzing…" : "Analyze"}</button>
        <Err>{err}</Err>
      </div>
      {res && (
        <div className="card">
          <div className="kpi">{res.score}% match</div>
          <div className="bar"><i style={{ width: res.score + "%" }} /></div>
          <p><b>Matched:</b> {res.matched.length ? <Badges items={res.matched} /> : <span className="mu">none</span>}</p>
          <p><b>Missing:</b> {res.missing.length ? <Badges items={res.missing} /> : <span className="okm">None – great fit!</span>}</p>
          {res.tips.length > 0 && <ul>{res.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
          <p className="mu"><small>An automated estimate of keyword and text similarity, not a hiring prediction.</small></p>
        </div>
      )}
    </>
  );
}
