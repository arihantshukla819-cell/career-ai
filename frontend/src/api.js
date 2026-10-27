const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const tok = {
  get: () => localStorage.getItem("token"),
  set: (t) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};
export async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (tok.get()) headers.Authorization = "Bearer " + tok.get();
  let body = opts.body;
  if (body && !(body instanceof FormData)) { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
  const r = await fetch(BASE + path, { ...opts, headers, body });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const det = Array.isArray(d.detail) ? d.detail.map((e) => e.msg.replace("Value error, ", "")).join(". ") : d.detail;
    throw new Error(det || "Request failed");
  }
  return d;
}
