export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

let csrfToken = null;

export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API_BASE}/csrf`, { credentials: "include" });
  const json = await res.json();
  csrfToken = json?.data?.token || null;
  return csrfToken;
}

export async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (csrfToken && !headers["X-CSRF-Token"]) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    const message = json?.error || "Request failed";
    throw new Error(message);
  }
  return json.data;
}
