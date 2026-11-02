const BASE = import.meta.env.VITE_API_URL || 'https://beaded-by-unknown.onrender.com';
const WAKE_DELAY_MS = 3000;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* retries covers Render waking from sleep. Bad requests never retry. */
export async function api(path, { method = 'GET', body, token, retries = 0, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 0; ; attempt += 1) {
    let res;
    try {
      res = await fetch(`${BASE}/api${path}`, { method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (attempt >= retries) throw new ApiError('Cannot reach the shop right now. Please try again.', 0);
      await wait(WAKE_DELAY_MS);
      continue;
    }

    if (res.status >= 500 && attempt < retries) {
      await wait(WAKE_DELAY_MS);
      continue;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status);
    return data;
  }
}
