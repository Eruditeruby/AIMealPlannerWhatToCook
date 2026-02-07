const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('[API] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('[API] BASE_URL:', BASE_URL);

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

const api = {
  get: (url: string) => request(url),
  post: (url: string, data: unknown) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url: string, data: unknown) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
};

export default api;
