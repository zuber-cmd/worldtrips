// Dev: Vite proxies /api → backend. Prod: VITE_API_URL = Render host only, e.g. https://xxx.onrender.com (no /api).
let API_ORIGIN = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
if (API_ORIGIN.endsWith('/api')) API_ORIGIN = API_ORIGIN.slice(0, -4).replace(/\/$/, '');
const BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

function safeJsonFromText(text) {
  const t = (text || '').trim();
  if (!t) return { success: false, message: 'Empty response from server.' };
  try {
    return JSON.parse(t);
  } catch {
    return { success: false, message: t.slice(0, 200) };
  }
}

function wrapResponse(res) {
  const textPromise = res.clone().text().catch(() => '');
  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    json: async () => {
      const text = await textPromise;
      return safeJsonFromText(text);
    },
  };
}

async function request(path, options = {}) {
  const token = localStorage.getItem('wt_access');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res = await fetch(BASE + path, { ...options, headers });
  let wrapped = wrapResponse(res);

  if (res.status === 401) {
    const refresh = localStorage.getItem('wt_refresh');
    if (refresh) {
      try {
        const rr = await fetch(BASE + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const rd = await wrapResponse(rr).json();
        if (rd.success) {
          localStorage.setItem('wt_access', rd.accessToken);
          localStorage.setItem('wt_refresh', rd.refreshToken);
          headers['Authorization'] = 'Bearer ' + rd.accessToken;
          res = await fetch(BASE + path, { ...options, headers });
          wrapped = wrapResponse(res);
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
  return wrapped;
}

const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
};

export default api;
