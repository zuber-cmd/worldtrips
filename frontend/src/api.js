// Dev: Vite proxies /api → backend. Prod (Vercel): set VITE_API_URL to your Render API origin (no trailing slash).
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('wt_access');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    const refresh = localStorage.getItem('wt_refresh');
    if (refresh) {
      try {
        const rr = await fetch(BASE + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const rd = await rr.json();
        if (rd.success) {
          localStorage.setItem('wt_access', rd.accessToken);
          localStorage.setItem('wt_refresh', rd.refreshToken);
          headers['Authorization'] = 'Bearer ' + rd.accessToken;
          res = await fetch(BASE + path, { ...options, headers });
        } else {
          localStorage.clear();
          window.location.href = '/login';
          return null;
        }
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return null;
      }
    }
  }
  return res;
}

const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
};

export default api;
