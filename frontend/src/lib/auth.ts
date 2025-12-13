export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }

  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function register(payload: any) {
  const res = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
  }

  return res.json();
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
}

export function getAuthHeaders() {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const headers = { ...(init?.headers || {}), ...getAuthHeaders() } as Record<string, string>;
  const res = await fetch(input, { ...(init || {}), headers });
  return res;
}
