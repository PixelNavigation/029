const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';

export async function postLogin({ email, password, role }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, role })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Login failed (${res.status})`);
  }

  const data = await res.json();
  return data;
}

export async function postSignup(payload) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Signup failed (${res.status})`);
  }

  const data = await res.json();
  return data;
}
