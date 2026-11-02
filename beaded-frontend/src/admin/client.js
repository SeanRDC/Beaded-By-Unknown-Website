import { BASE } from '../api/client.js';

/* Every call carries the studio key. Forms with pictures go as they are, everything else as JSON. */
export async function studio(path, { key, method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const headers = {};
  if (key) headers.admin_secret = key;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      cache: 'no-cache',
      body: isForm || body === undefined ? body : JSON.stringify(body)
    });
  } catch {
    throw new Error('Cannot reach the server. Please try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const failure = new Error(data?.error || 'That did not work. Please try again.');
    failure.status = res.status;
    throw failure;
  }
  return data;
}
