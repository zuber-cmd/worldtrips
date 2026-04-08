import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, Plane, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const BG_DESTINATIONS = ['🦁 Masai Mara','🏝️ Zanzibar','🗼 Paris','🌺 Bali','🌆 Dubai','🐠 Maldives','🌅 Santorini','⛩️ Tokyo'];

function AuthLayout({ children, title, sub, link }) {
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--bg)' }}>
      {/* Left panel */}
      <div style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40,
        background:'linear-gradient(145deg,#ffffff,#eef1ff)',
        borderRight:'1px solid rgba(124,58,237,.15)' }} className="hide-sm">
        {/* Mesh gradient */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(ellipse 70% 60% at 30% 30%, rgba(124,58,237,.2) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(6,182,212,.1) 0%, transparent 55%)', pointerEvents:'none' }} />
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(124,58,237,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,.04) 1px, transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:360 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', boxShadow:'0 8px 30px rgba(124,58,237,.5)' }}>
            <Plane size={30} color="#fff"/>
          </div>
          <h2 className="serif" style={{ fontSize:42, fontWeight:700, marginBottom:14, lineHeight:1.15 }}>
            Explore the<br/><span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>World</span>
          </h2>
          <p style={{ color:'rgba(109,40,217,.55)', fontSize:15, lineHeight:1.7, marginBottom:36 }}>
            15 hand-picked destinations, all priced in Kenya Shillings. Your journey starts here.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {BG_DESTINATIONS.map(d => (
              <span key={d} style={{ padding:'6px 14px', borderRadius:20, background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', fontSize:12, color:'var(--purple3)' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Plane size={18} color="#fff"/>
            </div>
            <div className="serif" style={{ fontSize:20, fontWeight:600 }}>
              World<span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Trips</span>
            </div>
          </div>
          {children}
          <p style={{ marginTop:24, textAlign:'center', fontSize:13, color:'var(--muted)' }}>{link}</p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon:Icon, label, type='text', value, onChange, placeholder, right }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:12, color:'var(--muted2)', display:'block', marginBottom:7, fontWeight:500 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <Icon size={15} color="var(--muted)" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="inp" style={{ paddingLeft:40, paddingRight:right?40:15 }} />
        {right}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { setError('Email and password are required.'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(email, pw);
      nav(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed.');
      setShake(true); setTimeout(() => setShake(false), 400);
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Welcome back" link={<>Don't have an account? <Link to="/signup" style={{ color:'#6d28d9', fontWeight:600 }}>Sign up free →</Link></>}>
      <h1 className="serif" style={{ fontSize:32, fontWeight:600, marginBottom:6 }}>Welcome back</h1>
      <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>Sign in to continue your journey</p>

      {error && (
        <div className={`${shake?'shake':''}`} style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'11px 14px', marginBottom:18, fontSize:13, color:'#f87171' }}>
          <AlertCircle size={15}/> {error}
        </div>
      )}

      <form onSubmit={submit}>
        <InputField icon={Mail} label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        <InputField icon={Lock} label="Password" type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"
          right={<button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }}>{show?<EyeOff size={15}/>:<Eye size={15}/>}</button>}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', padding:13, fontSize:15, marginTop:8, borderRadius:10 }}>
          {loading ? <><Spinner size={16} color="#fff"/> Signing in…</> : <>Sign In <ArrowRight size={16}/></>}
        </button>
      </form>
    </AuthLayout>
  );
}

export function SignupPage() {
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', password:'', confirm:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const nav = useNavigate();

  const set = k => e => setForm(p => ({...p, [k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name||!form.email||!form.password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await signup({ full_name: form.full_name, email: form.email, password: form.password, phone: form.phone });
      nav('/');
    } catch (err) { setError(err.message || 'Signup failed.'); }
    setLoading(false);
  };

  return (
    <AuthLayout link={<>Already have an account? <Link to="/login" style={{ color:'#6d28d9', fontWeight:600 }}>Sign in →</Link></>}>
      <h1 className="serif" style={{ fontSize:32, fontWeight:600, marginBottom:6 }}>Create account</h1>
      <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>Start your travel journey today</p>

      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'11px 14px', marginBottom:18, fontSize:13, color:'#f87171' }}>
          <AlertCircle size={15}/> {error}
        </div>
      )}

      <form onSubmit={submit}>
        <InputField icon={User} label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="John Kamau" />
        <InputField icon={Mail} label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <InputField icon={Phone} label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="+254 7XX XXX XXX" />
        <InputField icon={Lock} label="Password" type={show?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 characters"
          right={<button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }}>{show?<EyeOff size={15}/>:<Eye size={15}/>}</button>}
        />
        <InputField icon={Lock} label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
        <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', padding:13, fontSize:15, marginTop:8, borderRadius:10 }}>
          {loading ? <><Spinner size={16} color="#fff"/> Creating account…</> : <><Sparkles size={16}/> Create Account</>}
        </button>
      </form>
    </AuthLayout>
  );
}