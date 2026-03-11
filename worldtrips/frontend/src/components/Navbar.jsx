import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, Settings, ChevronDown, Menu, X, Home, Package, BookOpen, Map, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to:'/',          label:'Home',    icon:Home },
    { to:'/packages',  label:'Explore', icon:Package },
    { to:'/book',      label:'Book',    icon:BookOpen },
    { to:'/itinerary', label:'Plan',    icon:Map },
    { to:'/chat',      label:'AI Chat', icon:MessageCircle },
  ];

  const handleLogout = async () => { setUserOpen(false); await logout(); nav('/welcome'); };
  const initial = user?.full_name?.[0]?.toUpperCase() || '?';
  const isActive = (path) => loc.pathname === path;

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:200,
        height:64, background:'rgba(6,4,26,.95)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(124,58,237,.12)',
        display:'flex', alignItems:'center', padding:'0 20px', gap:10,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(124,58,237,.4)' }}>
            <Plane size={18} color="#fff" />
          </div>
          <div className="hide-sm">
            <div className="serif" style={{ fontSize:17, fontWeight:600, lineHeight:1 }}>
              World<span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Trips</span>
            </div>
            <div style={{ fontSize:8, color:'var(--muted)', letterSpacing:'2.5px' }}>TRAVEL AGENCY</div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hide-sm" style={{ display:'flex', gap:2, marginLeft:12 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'7px 13px', borderRadius:8, fontSize:13, textDecoration:'none', transition:'all .18s',
              fontWeight: isActive(l.to) ? 600 : 400,
              color: isActive(l.to) ? '#a78bfa' : '#6b7280',
              background: isActive(l.to) ? 'rgba(124,58,237,.12)' : 'transparent',
              border: isActive(l.to) ? '1px solid rgba(124,58,237,.2)' : '1px solid transparent',
            }}>{l.label}</Link>
          ))}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {user?.role === 'admin' && (
            <Link to="/admin" className="hide-sm" style={{
              display:'inline-flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:8, fontSize:12, fontWeight:600,
              background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.25)', color:'#fbbf24', textDecoration:'none', transition:'all .2s',
            }}>
              <Settings size={13} /> Admin
            </Link>
          )}

          {/* User menu */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setUserOpen(!userOpen)} style={{
              display:'flex', alignItems:'center', gap:8, padding:'6px 10px',
              background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.25)',
              borderRadius:10, cursor:'pointer', transition:'all .2s',
            }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0, boxShadow:'0 2px 10px rgba(124,58,237,.4)' }}>{initial}</div>
              <span className="hide-sm" style={{ fontSize:13, fontWeight:500, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)' }}>{user?.full_name}</span>
              <ChevronDown size={13} color="var(--muted)" />
            </button>

            {userOpen && (
              <div style={{ position:'absolute', top:'115%', right:0, background:'#0c0a2e', border:'1px solid rgba(124,58,237,.25)', borderRadius:12, minWidth:190, padding:'8px 0', boxShadow:'0 20px 60px rgba(0,0,0,.7)', zIndex:300 }}>
                <div style={{ padding:'10px 16px 12px', borderBottom:'1px solid rgba(124,58,237,.1)', marginBottom:4 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{user?.full_name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{user?.email}</div>
                  {user?.role === 'admin' && <span className="badge badge-gold" style={{ marginTop:6, display:'inline-block', fontSize:10 }}>Admin</span>}
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setUserOpen(false)} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 16px', fontSize:13, color:'var(--muted2)', textDecoration:'none', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <Settings size={14} /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'10px 16px', fontSize:13, color:'var(--red)', background:'none', border:'none', textAlign:'left', cursor:'pointer', transition:'background .15s', fontFamily:'Plus Jakarta Sans,sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>

          <button className="btn-ghost show-sm" style={{ padding:7 }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="show-sm" style={{ position:'fixed', top:64, left:0, right:0, zIndex:199, background:'rgba(6,4,26,.98)', borderBottom:'1px solid rgba(124,58,237,.12)', padding:'8px 0', backdropFilter:'blur(20px)' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
              display:'flex', alignItems:'center', gap:12, padding:'13px 22px', fontSize:15, textDecoration:'none',
              color: isActive(l.to) ? '#a78bfa' : 'var(--muted2)',
              borderLeft:`3px solid ${isActive(l.to) ? '#7c3aed' : 'transparent'}`,
              background: isActive(l.to) ? 'rgba(124,58,237,.06)' : 'transparent',
            }}>
              <l.icon size={16}/> {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 22px', fontSize:15, color:'#fbbf24', textDecoration:'none' }}>
              <Settings size={16}/> Admin Panel
            </Link>
          )}
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'13px 22px', fontSize:15, color:'var(--red)', background:'none', border:'none', textAlign:'left', cursor:'pointer' }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      )}

      {/* Bottom nav for mobile */}
      <nav className="bottom-nav" style={{ justifyContent:'space-around' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'4px 8px', textDecoration:'none', color: isActive(l.to) ? '#a78bfa' : 'var(--muted)', fontSize:9, fontWeight: isActive(l.to) ? 600 : 400 }}>
            <l.icon size={20}/>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}