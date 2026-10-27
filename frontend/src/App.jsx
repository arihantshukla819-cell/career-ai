import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { api, tok } from "./api.js";
import Home from "./pages/Home.jsx";
import { Jobs, JobDetail } from "./pages/Jobs.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { Login, Register } from "./pages/Auth.jsx";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const nav = useNavigate();
  const refresh = useCallback(async () => {
    if (!tok.get()) { setUser(null); setReady(true); return; }
    try { setUser(await api("/auth/me")); } catch { tok.clear(); setUser(null); }
    setReady(true);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  const logout = () => { tok.clear(); setUser(null); nav("/"); };

  return (
    <Ctx.Provider value={{ user, ready, refresh }}>
      <header>
        <Link to="/" className="logo">✦ CareerAI</Link>
        <nav>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/analyzer">Resume Analyzer</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        {user ? (<><span className="mu">Hi, {user.name}</span><button className="btn o" onClick={logout}>Logout</button></>)
          : (<><Link className="btn o" to="/login">Log in</Link><Link className="btn g" to="/register">Sign up</Link></>)}
        <button className="btn o" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/analyzer" element={<Protected><Analyzer /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div className="card">Page not found.</div>} />
        </Routes>
      </main>
      <footer>© 2026 CareerAI · <Link to="/">Privacy</Link> · <Link to="/jobs">Jobs</Link><br /><small>Jobs shown are sample records unless a job API is configured.</small></footer>
    </Ctx.Provider>
  );
}
