import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const Ctx = createContext(null);

export function useAuth() {
  return useContext(Ctx);
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wt_access');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => r && r.json())
      .then(d => { if (d && d.success) setUser(d.user); else localStorage.clear(); })
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res  = await api.post('/auth/login', { email, password });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('wt_access',  data.accessToken);
    localStorage.setItem('wt_refresh', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const res  = await api.post('/auth/signup', payload);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    localStorage.setItem('wt_access',  data.accessToken);
    localStorage.setItem('wt_refresh', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('wt_refresh');
    try { await api.post('/auth/logout', { refreshToken: refresh }); } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}
