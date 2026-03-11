import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MapPin, TrendingUp, Calendar, DollarSign, Globe, ChevronRight,
  Plane, Star, Clock, ArrowUpRight, Sparkles, Package, MessageCircle,
  CheckCircle, AlertCircle, XCircle, RefreshCw, Map
} from 'lucide-react';
import { kes, Spinner, DestImg } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/* ── animated counter ── */
function Counter({ value, prefix='', suffix='', duration=1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * ease));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

/* ── status pill ── */
function StatusPill({ status }) {
  const map = {
    confirmed:  { bg:'rgba(16,185,129,.15)', c:'#34d399', border:'rgba(16,185,129,.3)',  icon:<CheckCircle size={11}/>, label:'Confirmed'  },
    completed:  { bg:'rgba(99,102,241,.15)', c:'#818cf8', border:'rgba(99,102,241,.3)',  icon:<CheckCircle size={11}/>, label:'Completed'  },
    pending:    { bg:'rgba(245,158,11,.12)', c:'#fbbf24', border:'rgba(245,158,11,.3)',  icon:<Clock size={11}/>,       label:'Pending'    },
    cancelled:  { bg:'rgba(239,68,68,.12)',  c:'#f87171', border:'rgba(239,68,68,.3)',   icon:<XCircle size={11}/>,     label:'Cancelled'  },
    rejected:   { bg:'rgba(239,68,68,.12)',  c:'#f87171', border:'rgba(239,68,68,.3)',   icon:<XCircle size={11}/>,     label:'Rejected'   },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:s.bg, border:`1px solid ${s.border}`, color:s.c, fontSize:11, fontWeight:600 }}>
      {s.icon} {s.label}
    </span>
  );
}

/* ── custom tooltip ── */
function ChartTip({ active, payload, label, prefix='' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,15,30,.97)', border:'1px solid rgba(13,148,136,.25)', borderRadius:10, padding:'10px 14px', fontSize:12, boxShadow:'0 10px 30px rgba(0,0,0,.5)' }}>
      <div style={{ color:'#94a3b8', marginBottom:6 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:700 }}>{prefix}{p.value?.toLocaleString()}</div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [dests, setDests]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeChart, setActiveChart] = useState('spending');

  useEffect(() => {
    Promise.all([
      api.get('/bookings?limit=50').then(r => r?.json()),
      api.get('/destinations').then(r => r?.json()),
    ]).then(([b, d]) => {
      if (b?.success) setBookings(b.bookings);
      if (d?.success) setDests(d.destinations);
      setLoading(false);
    });
  }, []);

  /* ── derived stats ── */
  const totalSpent    = bookings.reduce((s,b) => s + (parseFloat(b.total_amount)||0), 0);
  const confirmed     = bookings.filter(b => ['confirmed','completed'].includes(b.status));
  const upcoming      = bookings.filter(b => b.status==='confirmed' && new Date(b.check_in) > new Date());
  const uniqueDests   = [...new Set(bookings.map(b => b.destination_name).filter(Boolean))];
  const totalNights   = bookings.reduce((s,b) => {
    const ci = new Date(b.check_in), co = new Date(b.check_out);
    return s + (isNaN(ci)||isNaN(co) ? 0 : Math.max(0, Math.ceil((co-ci)/86400000)));
  }, 0);

  /* ── spending chart data (last 6 months) ── */
  const spendingData = (() => {
    const months = [];
    for (let i=5; i>=0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('en',{month:'short'});
      const spend = bookings
        .filter(b => b.created_at?.startsWith(key))
        .reduce((s,b) => s + (parseFloat(b.total_amount)||0), 0);
      const count = bookings.filter(b => b.created_at?.startsWith(key)).length;
      months.push({ label, spend, count });
    }
    return months;
  })();

  /* ── destination breakdown (pie) ── */
  const destBreakdown = (() => {
    const map = {};
    bookings.forEach(b => {
      if (!b.destination_name) return;
      map[b.destination_name] = (map[b.destination_name]||0) + (parseFloat(b.total_amount)||0);
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value]) => ({ name, value }));
  })();

  const PIE_COLORS = ['#0d9488','#f59e0b','#6366f1','#f43f5e','#22d3ee'];

  /* ── status breakdown ── */
  const statusData = [
    { name:'Confirmed', value: bookings.filter(b=>b.status==='confirmed').length,  fill:'#0d9488' },
    { name:'Completed', value: bookings.filter(b=>b.status==='completed').length,  fill:'#6366f1' },
    { name:'Pending',   value: bookings.filter(b=>b.status==='pending').length,    fill:'#f59e0b' },
    { name:'Cancelled', value: bookings.filter(b=>b.status==='cancelled').length,  fill:'#f43f5e' },
  ].filter(s=>s.value>0);

  const firstName = user?.full_name?.split(' ')[0] || 'Traveller';
  const hour = new Date().getHours();
  const greeting = hour<12 ? 'Good morning' : hour<17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16, animation:'float 2s ease-in-out infinite' }}>✈️</div>
        <Spinner size={28}/>
        <div style={{ color:'var(--muted)', fontSize:13, marginTop:12 }}>Loading your dashboard…</div>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(13,148,136,.2)} 50%{box-shadow:0 0 40px rgba(13,148,136,.4)} }
        .dash-card { background:rgba(13,20,40,.7);border:1px solid rgba(13,148,136,.1);border-radius:16px;backdrop-filter:blur(12px);transition:all .3s; }
        .dash-card:hover { border-color:rgba(13,148,136,.25);box-shadow:0 8px 30px rgba(0,0,0,.3); }
        .stat-glow:hover { animation:glow 2s ease-in-out infinite; }
        .anim-0{animation:slideIn .5s ease forwards;animation-delay:.05s;opacity:0}
        .anim-1{animation:slideIn .5s ease forwards;animation-delay:.1s;opacity:0}
        .anim-2{animation:slideIn .5s ease forwards;animation-delay:.15s;opacity:0}
        .anim-3{animation:slideIn .5s ease forwards;animation-delay:.2s;opacity:0}
        .anim-4{animation:slideIn .5s ease forwards;animation-delay:.25s;opacity:0}
        .anim-5{animation:slideIn .5s ease forwards;animation-delay:.3s;opacity:0}
        .anim-6{animation:slideIn .5s ease forwards;animation-delay:.35s;opacity:0}
        .booking-row:hover { background:rgba(13,148,136,.05) !important; }
        .quick-btn:hover { transform:translateY(-3px);border-color:rgba(13,148,136,.5) !important; }
      `}</style>

      {/* Decorative background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(13,148,136,.08) 0%, transparent 65%)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 65%)', filter:'blur(50px)' }}/>
        <div style={{ position:'absolute', top:'40%', left:'40%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,.04) 0%, transparent 65%)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,148,136,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,.025) 1px, transparent 1px)', backgroundSize:'48px 48px' }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'32px 24px 80px' }}>

        {/* ── Header ── */}
        <div className="anim-0" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,.1)', border:'1px solid rgba(13,148,136,.2)', borderRadius:20, padding:'5px 14px', marginBottom:14, fontSize:11, color:'#2dd4bf', fontWeight:600, letterSpacing:.5 }}>
              <Sparkles size={11}/> PERSONAL TRAVEL DASHBOARD
            </div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,4vw,44px)', fontWeight:800, lineHeight:1.15, marginBottom:8 }}>
              {greeting},<br/>
              <span style={{ background:'linear-gradient(135deg,#2dd4bf,#0d9488)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{firstName} </span>
            </h1>
            <p style={{ color:'#64748b', fontSize:14 }}>Here's an overview of your travel journey and spending.</p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={() => nav('/packages')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 20px', background:'rgba(13,148,136,.12)', border:'1px solid rgba(13,148,136,.3)', borderRadius:12, color:'#2dd4bf', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'Plus Jakarta Sans,sans-serif' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(13,148,136,.22)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(13,148,136,.12)'}>
              <Globe size={15}/> Explore
            </button>
            <button onClick={() => nav('/book')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'linear-gradient(135deg,#0d9488,#0f766e)', border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 20px rgba(13,148,136,.35)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 30px rgba(13,148,136,.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(13,148,136,.35)'}}>
              <Plane size={15}/> Book Trip
            </button>
          </div>
        </div>

        {/* ── KPI stat cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Spent',       val:totalSpent,         format:'kes',    icon:'', color:'#f59e0b', glow:'rgba(245,158,11,.15)',  sub:`${bookings.length} bookings total`, delay:'anim-1' },
            { label:'Trips Taken',       val:confirmed.length,   format:'num',    icon:'', color:'#0d9488', glow:'rgba(13,148,136,.15)',  sub:`${uniqueDests.length} destinations`, delay:'anim-2' },
            { label:'Upcoming Trips',    val:upcoming.length,    format:'num',    icon:'', color:'#6366f1', glow:'rgba(99,102,241,.15)',  sub:'confirmed & ahead', delay:'anim-3' },
            { label:'Nights Travelled',  val:totalNights,        format:'num',    icon:'', color:'#f43f5e', glow:'rgba(244,63,94,.15)',   sub:'across all trips', delay:'anim-4' },
          ].map(s => (
            <div key={s.label} className={`dash-card stat-glow ${s.delay}`} style={{ padding:'20px 22px', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:s.glow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                <ArrowUpRight size={14} color={s.color} style={{ opacity:.7 }}/>
              </div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:s.color, marginBottom:4, lineHeight:1 }}>
                {s.format==='kes'
                  ? <Counter value={Math.round(totalSpent/1000)} prefix="KES " suffix="K"/>
                  : <Counter value={s.val}/>
                }
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#475569' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:20 }}>

          {/* Spending / Bookings chart */}
          <div className="dash-card anim-5" style={{ padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:3 }}>Travel Analytics</div>
                <div style={{ fontSize:12, color:'#475569' }}>Last 6 months overview</div>
              </div>
              <div style={{ display:'flex', gap:6, background:'rgba(0,0,0,.3)', borderRadius:8, padding:4 }}>
                {[['spending','Spending'],['bookings','Bookings']].map(([k,l]) => (
                  <button key={k} onClick={() => setActiveChart(k)} style={{ padding:'5px 14px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .2s', border:'none', fontFamily:'Plus Jakarta Sans,sans-serif', background:activeChart===k?'rgba(13,148,136,.3)':'transparent', color:activeChart===k?'#2dd4bf':'#475569' }}>{l}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {activeChart==='spending' ? (
                <AreaChart data={spendingData} margin={{ top:5, right:5, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                  <XAxis dataKey="label" stroke="#334155" fontSize={11} tick={{ fill:'#475569' }} axisLine={false} tickLine={false}/>
                  <YAxis stroke="#334155" fontSize={10} tick={{ fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                  <Tooltip content={<ChartTip prefix="KES "/>}/>
                  <Area type="monotone" dataKey="spend" stroke="#0d9488" strokeWidth={2.5} fill="url(#tg)" dot={{ fill:'#0d9488', strokeWidth:0, r:4 }} activeDot={{ r:6, fill:'#2dd4bf', strokeWidth:0 }}/>
                </AreaChart>
              ) : (
                <BarChart data={spendingData} margin={{ top:5, right:5, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={.9}/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                  <XAxis dataKey="label" stroke="#334155" fontSize={11} tick={{ fill:'#475569' }} axisLine={false} tickLine={false}/>
                  <YAxis stroke="#334155" fontSize={11} tick={{ fill:'#475569' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Bar dataKey="count" fill="url(#bg2)" radius={[6,6,0,0]} maxBarSize={48}/>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="dash-card anim-6" style={{ padding:24, display:'flex', flexDirection:'column' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:4 }}>
              {destBreakdown.length > 0 ? 'Spending by Destination' : 'Booking Status'}
            </div>
            <div style={{ fontSize:12, color:'#475569', marginBottom:16 }}>Breakdown overview</div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              {destBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={destBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {destBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent"/>)}
                      </Pie>
                      <Tooltip content={({ active, payload }) => active && payload?.length ? (
                        <div style={{ background:'rgba(10,15,30,.97)', border:'1px solid rgba(13,148,136,.2)', borderRadius:8, padding:'8px 12px', fontSize:11 }}>
                          <div style={{ color:'#94a3b8', marginBottom:3 }}>{payload[0].name}</div>
                          <div style={{ color:payload[0].payload.fill || '#2dd4bf', fontWeight:700 }}>KES {payload[0].value?.toLocaleString()}</div>
                        </div>
                      ) : null}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                    {destBreakdown.map((d,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i % PIE_COLORS.length], flexShrink:0 }}/>
                          <span style={{ color:'#94a3b8' }}>{d.name}</span>
                        </div>
                        <span style={{ fontWeight:700, color:'#e2e8f0' }}>KES {(d.value/1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={statusData.length > 0 ? statusData : [{name:'No trips yet',value:1}]} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {(statusData.length > 0 ? statusData : [{fill:'rgba(255,255,255,.05)'}]).map((d, i) => <Cell key={i} fill={d.fill || 'rgba(255,255,255,.05)'} stroke="transparent"/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ textAlign:'center', fontSize:12, color:'#475569' }}>Book your first trip to see stats!</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content: Bookings + Quick actions ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, marginBottom:20 }}>

          {/* Recent bookings */}
          <div className="dash-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(13,148,136,.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:2 }}>My Bookings</div>
                <div style={{ fontSize:12, color:'#475569' }}>{bookings.length} total · {upcoming.length} upcoming</div>
              </div>
              <button onClick={() => nav('/book')} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 14px', background:'rgba(13,148,136,.1)', border:'1px solid rgba(13,148,136,.25)', borderRadius:8, color:'#2dd4bf', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                + New
              </button>
            </div>

            {bookings.length === 0 ? (
              <div style={{ padding:'60px 24px', textAlign:'center' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>🌍</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:8 }}>No trips yet</div>
                <p style={{ color:'#475569', fontSize:13, marginBottom:20 }}>Book your first adventure today!</p>
                <button onClick={() => nav('/packages')} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#0d9488,#0f766e)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  Explore Destinations →
                </button>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'rgba(0,0,0,.2)' }}>
                      {['Destination','Dates','Guests','Total','Status'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:10, color:'#475569', letterSpacing:1, fontWeight:600, textTransform:'uppercase', fontFamily:'Plus Jakarta Sans,sans-serif', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0,8).map((b,i) => (
                      <tr key={b.id} className="booking-row" style={{ borderBottom:'1px solid rgba(255,255,255,.03)', transition:'background .15s', cursor:'default' }}>
                        <td style={{ padding:'14px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:9, background:'rgba(13,148,136,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                              {b.destination_emoji || '🌍'}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13 }}>{b.destination_name || '—'}</div>
                              <div style={{ fontSize:10, color:'#475569', fontFamily:'monospace' }}>{b.reference}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          <div style={{ fontSize:12, color:'#94a3b8' }}>
                            {b.check_in ? new Date(b.check_in).toLocaleDateString('en',{day:'numeric',month:'short'}) : '—'}
                            {b.check_out && <> → {new Date(b.check_out).toLocaleDateString('en',{day:'numeric',month:'short'})}</>}
                          </div>
                        </td>
                        <td style={{ padding:'14px 16px', fontSize:13, color:'#94a3b8', textAlign:'center' }}>{b.guests || '—'}</td>
                        <td style={{ padding:'14px 16px' }}>
                          <div style={{ fontWeight:700, fontSize:13, color:'#fbbf24' }}>{kes(b.total_amount)}</div>
                        </td>
                        <td style={{ padding:'14px 16px' }}>
                          <StatusPill status={b.status}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Quick actions */}
            <div className="dash-card" style={{ padding:20 }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Book a Trip',       icon:'✈️', path:'/book',      color:'#0d9488' },
                  { label:'Explore Packages',  icon:'🌍', path:'/packages',  color:'#6366f1' },
                  { label:'Plan Itinerary',    icon:'🗺️', path:'/itinerary', color:'#f59e0b' },
                  { label:'AI Travel Chat',    icon:'🤖', path:'/chat',      color:'#f43f5e' },
                ].map(a => (
                  <button key={a.label} className="quick-btn" onClick={() => nav(a.path)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:11, cursor:'pointer', transition:'all .2s', fontFamily:'Plus Jakarta Sans,sans-serif', width:'100%', textAlign:'left',
                  }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:`${a.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{a.icon}</div>
                    <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{a.label}</span>
                    <ChevronRight size={14} color="#334155" style={{ marginLeft:'auto' }}/>
                  </button>
                ))}
              </div>
            </div>

            {/* Destinations visited */}
            <div className="dash-card" style={{ padding:20 }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, marginBottom:4 }}>Places Visited</div>
              <div style={{ fontSize:11, color:'#475569', marginBottom:12 }}>{uniqueDests.length} destination{uniqueDests.length!==1?'s':''} explored</div>
              {uniqueDests.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:'#334155', fontSize:12 }}>
                  <div style={{ fontSize:30, marginBottom:8 }}>🗺️</div>No destinations yet
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {uniqueDests.map(d => (
                    <span key={d} style={{ padding:'5px 10px', background:'rgba(13,148,136,.1)', border:'1px solid rgba(13,148,136,.2)', borderRadius:20, fontSize:11, color:'#2dd4bf', fontWeight:500 }}>
                      {dests.find(x=>x.name===d)?.emoji || '🌍'} {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Featured destinations ── */}
        <div className="dash-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, marginBottom:2 }}>Discover Next</div>
              <div style={{ fontSize:12, color:'#475569' }}>Top destinations to explore</div>
            </div>
            <button onClick={() => nav('/packages')} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 14px', background:'rgba(13,148,136,.08)', border:'1px solid rgba(13,148,136,.2)', borderRadius:8, color:'#2dd4bf', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              View all <ChevronRight size={12}/>
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
            {dests.slice(0,6).map((d,i) => (
              <div key={d.id} onClick={() => nav('/book', { state:{ dest:d } })} style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', border:'1px solid rgba(255,255,255,.06)', transition:'all .3s', position:'relative' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(13,148,136,.3)'; e.currentTarget.style.boxShadow='0 15px 35px rgba(0,0,0,.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ height:110, position:'relative', overflow:'hidden' }}>
                  <DestImg dest={d}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,15,30,.95) 0%, rgba(10,15,30,.1) 50%, transparent 100%)' }}/>
                  <div style={{ position:'absolute', top:8, right:8, background:'rgba(10,15,30,.8)', borderRadius:20, padding:'3px 8px', fontSize:10, display:'flex', alignItems:'center', gap:3, backdropFilter:'blur(8px)' }}>
                    <Star size={9} fill="#f59e0b" color="#f59e0b"/> {d.rating}
                  </div>
                  <div style={{ position:'absolute', bottom:8, left:10 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{d.emoji} {d.name}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', display:'flex', alignItems:'center', gap:3 }}><MapPin size={8}/>{d.country}</div>
                  </div>
                </div>
                <div style={{ padding:'10px 12px', background:'rgba(13,20,40,.8)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:10, color:'#475569', fontWeight:500 }}>From</span>
                    <span style={{ fontSize:13, fontWeight:800, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{kes(d.base_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}