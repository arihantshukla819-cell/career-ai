import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, tok } from "../api.js";
import { useAuth } from "../App.jsx";
import { Err } from "../components.jsx";

function Form({ reg }) {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (reg) {
      if (!d.name.trim()) return setErr("Please enter your name.");
      if (d.password.length < 8) return setErr("Password needs 8+ characters.");
      if (d.password !== d.confirm_password) return setErr("Passwords do not match.");
    }
    setBusy(true); setErr("");
    try {
      const { token } = await api(reg ? "/auth/register" : "/auth/login", { method: "POST", body: d });
      tok.set(token); await refresh(); nav("/dashboard");
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const t = show ? "text" : "password";
  return (
    <form className="f card" onSubmit={submit} noValidate>
      <h1>{reg ? "Create account" : "Welcome back"}</h1>
      {reg && <label>Name<input name="name" autoComplete="name" /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" /></label>
      <label>Password<input name="password" type={t} autoComplete={reg ? "new-password" : "current-password"} /></label>
      {reg && <label>Confirm password<input name="confirm_password" type={t} autoComplete="new-password" /></label>}
      <label className="row"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} style={{ width: "auto" }} /> Show password</label>
      <Err>{err}</Err>
      <button className="btn g" disabled={busy}>{busy ? "Please wait…" : reg ? "Sign up" : "Log in"}</button>
      <small className="mu">{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</small>
    </form>
  );
}
export const Login = () => <Form />;
export const Register = () => <Form reg />;
