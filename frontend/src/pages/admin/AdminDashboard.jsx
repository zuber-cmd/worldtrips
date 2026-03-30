import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, BookOpen, Globe, Users, TrendingUp, DollarSign, Clock, RefreshCw, Plus, Trash2, Edit, CheckCircle, XCircle, Download, Search, Shield, ArrowUpRight, Zap, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { kes, Spinner, StatusBadge, Modal, Confirm, toast, Empty, Pagination } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const TABS = [
  { id:'overview',     icon:BarChart2,  label:'Overview' },
  { id:'bookings',     icon:BookOpen,   label:'Bookings' },
  { id:'destinations', icon:Globe,      label:'Destinations' },
  { id:'users',        icon:Users,      label:'Users' },
  { id:'analytics',    icon:TrendingUp, label:'Analytics' },
];

const REGIONS = ['Africa','Asia','Europe','Americas','Middle East','Oceania'];
const CATS    = ['Safari','Beach','City','Culture','Adventure','Romance','Luxury'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const { user } = useAuth();
  const nav = useNavigate();
  if (!user || user.role !== 'admin') { nav('/'); return null; }

  return (
    <div style={{ paddingTop:64, background:'var(--bg)', minHeight:'100vh' }}>
      <div className="admin-wrap">

        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'2px', padding:'0 10px', marginBottom:10, textTransform:'uppercase' }}>Management</div>
            {TABS.map(t => (
              <button key={t.id} className={`nav-link ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
                <t.icon size={15}/> {t.label}
              </button>
            ))}
            <div style={{ height:1, background:'rgba(124,58,237,.1)', margin:'14px 0' }}/>
            <button className="nav-link" onClick={() => nav('/')}><Globe size={15}/> Customer View</button>
          </div>
          <div style={{ marginTop:'auto', padding:'12px 4px 0' }}>
            <div style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--purple2)', marginBottom:3 }}>Admin Panel</div>
              <div style={{ fontSize:10, color:'var(--muted)', wordBreak:'break-all' }}>{user?.email}</div>
              <div style={{ marginTop:8 }}><span className="badge badge-gold" style={{ fontSize:9 }}>Admin</span></div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* Mobile tabs */}
          <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto', paddingBottom:4 }} className="show-sm">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`chip ${tab===t.id?'active-purple':''}`} style={{ whiteSpace:'nowrap', fontSize:11 }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab==='overview'     && <OverviewTab/>}
          {tab==='bookings'     && <BookingsTab/>}
          {tab==='destinations' && <DestinationsTab/>}
          {tab==='users'        && <UsersTab/>}
          {tab==='analytics'    && <AnalyticsTab/>}
        </main>
      </div>
    </div>
  );
}

/* ── OVERVIEW ─────────────────────────────────────── */
function OverviewTab() {
  const [stats, setStats]   = useState(null);
  const [chart, setChart]   = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, b] = await Promise.all([
      api.get('/admin/stats').then(r=>r&&r.json()),
      api.get('/bookings?limit=6').then(r=>r&&r.json()),
    ]);
    if (s?.success) { setStats(s.stats); setChart(s.revenueChart||[]); }
    if (b?.success) setRecent(b.bookings);
    setLoading(false);
  },[]);

  useEffect(() => { load(); },[load]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36}/></div>;

  const MOCK = [{month:'Sep',revenue:5460000},{month:'Oct',revenue:7540000},{month:'Nov',revenue:4550000},{month:'Dec',revenue:11310000},{month:'Jan',revenue:8450000},{month:'Feb',revenue:9620000}];
  const chartData = chart.length
    ? chart.map(c => ({ month:new Date(c.month).toLocaleDateString('en',{month:'short'}), revenue:parseInt(c.revenue)||0 }))
    : MOCK;

  const CARDS = [
    { label:'Total Revenue',   val:kes(stats?.totalRevenue||0),  icon:DollarSign, c:'#f59e0b', bg:'rgba(245,158,11,.12)' },
    { label:'All Bookings',    val:stats?.totalBookings||0,       icon:BookOpen,   c:'#a78bfa', bg:'rgba(124,58,237,.12)' },
    { label:'Pending Review',  val:stats?.pendingBookings||0,     icon:Clock,      c:'#22d3ee', bg:'rgba(6,182,212,.12)' },
    { label:'Customers',       val:stats?.totalCustomers||0,      icon:Users,      c:'#34d399', bg:'rgba(16,185,129,.12)' },
    { label:'Destinations',    val:stats?.totalDestinations||0,   icon:Globe,      c:'#f472b6', bg:'rgba(236,72,153,.12)' },
  ];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <span className="section-tag">ADMIN</span>
          <h2 className="serif" style={{ fontSize:32, fontWeight:700 }}>Dashboard <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Overview</span></h2>
        </div>
        <button className="btn-ghost" onClick={load} style={{ gap:6 }}><RefreshCw size={14}/> Refresh</button>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {CARDS.map(c => (
          <div key={c.label} className="stat-card" style={{ cursor:'default' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <c.icon size={18} color={c.c}/>
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:c.c, marginBottom:4, fontFamily:'Fraunces,serif' }}>{c.val}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding:22, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h4 style={{ fontWeight:700, fontSize:14 }}>Revenue — Last 6 Months</h4>
          <span className="badge badge-purple" style={{ fontSize:10 }}><Activity size={10}/> Live</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,.08)"/>
            <XAxis dataKey="month" stroke="var(--muted)" fontSize={11}/>
            <YAxis stroke="var(--muted)" fontSize={10} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`}/>
            <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid rgba(124,58,237,.25)', borderRadius:10, color:'var(--text)', fontSize:12 }} formatter={v=>kes(v)}/>
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#rg)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent bookings */}
      <div className="card" style={{ padding:20 }}>
        <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Recent Bookings</h4>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl" style={{ minWidth:580 }}>
            <thead><tr>{['Reference','Customer','Destination','Total','Status','Payment'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {recent.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--muted)' }}>{b.reference}</td>
                  <td style={{ fontWeight:600, fontSize:13 }}>{b.customer_name}</td>
                  <td style={{ color:'#fbbf24', fontWeight:500 }}>{b.destination_emoji} {b.destination_name}</td>
                  <td style={{ fontWeight:700 }}>{kes(b.total_amount)}</td>
                  <td><StatusBadge status={b.status}/></td>
                  <td><StatusBadge status={b.payment_status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length===0 && <Empty icon="📋" title="No bookings yet"/>}
        </div>
      </div>
    </div>
  );
}

/* ── BOOKINGS ─────────────────────────────────────── */
function BookingsTab() {
  const [list, setList]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('all');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [delId, setDelId]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit:15, status:statusF });
    if (search) p.set('search', search);
    const r = await api.get('/bookings?'+p).then(r=>r&&r.json());
    if (r?.success) { setList(r.bookings); setTotal(r.total); }
    setLoading(false);
  },[page, search, statusF]);

  useEffect(() => { load(); },[load]);

  const updateStatus = async (id, status, notes='') => {
    const r = await api.patch(`/bookings/${id}/status`,{status,admin_notes:notes}).then(r=>r&&r.json());
    if (r?.success) { toast(`Booking ${status}`,'success'); load(); setSelected(null); }
    else toast(r?.message||'Failed','error');
  };

  const updatePayment = async (id, payment_status) => {
    const r = await api.patch(`/bookings/${id}/payment`,{payment_status}).then(r=>r&&r.json());
    if (r?.success) { toast('Payment updated','success'); load(); if(selected) setSelected(p=>({...p,payment_status})); }
    else toast(r?.message||'Failed','error');
  };

  const deleteBk = async () => {
    const r = await api.delete(`/bookings/${delId}`).then(r=>r&&r.json());
    if (r?.success) { toast('Booking deleted','success'); load(); }
    else toast(r?.message||'Failed','error');
  };

  const STATUSES = ['all','pending','confirmed','completed','cancelled','rejected'];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <span className="section-tag">MANAGE</span>
          <h2 className="serif" style={{ fontSize:30, fontWeight:700 }}>All <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Bookings</span></h2>
        </div>
        <a href={`${import.meta.env.VITE_API_URL||'http://localhost:4000/api'}/admin/export?format=csv`} target="_blank" className="btn-outline" style={{ fontSize:12, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
          <Download size={13}/> Export CSV
        </a>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.85)', border:'1px solid rgba(124,58,237,.18)', borderRadius:10, padding:'10px 14px', flex:'1 1 200px', maxWidth:300 }}>
          <Search size={14} color="var(--purple2)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings…"
            style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, flex:1, fontFamily:'Plus Jakarta Sans,sans-serif' }}/>
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusF(s); setPage(1); }} className={`chip ${statusF===s?'active-purple':''}`} style={{ fontSize:11, textTransform:'capitalize' }}>
              {s==='all'?'All':s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32}/></div>
        : list.length===0 ? <Empty icon="📋" title="No bookings found"/>
        : (
          <div className="card" style={{ overflowX:'auto', marginBottom:16 }}>
            <table className="tbl" style={{ minWidth:760 }}>
              <thead><tr>{['Reference','Customer','Destination','Guests','Dates','Total','Status','Payment','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {list.map(b => (
                  <tr key={b.id} style={{ cursor:'pointer' }} onClick={() => setSelected(b)}>
                    <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--purple2)' }}>{b.reference}</td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{b.customer_name}</td>
                    <td style={{ color:'#fbbf24', fontWeight:500 }}>{b.destination_emoji} {b.destination_name}</td>
                    <td style={{ textAlign:'center', fontSize:13 }}>{b.guests}</td>
                    <td style={{ fontSize:11, color:'var(--muted)' }}>{b.check_in} → {b.check_out}</td>
                    <td style={{ fontWeight:700, color:'#fbbf24' }}>{kes(b.total_amount)}</td>
                    <td><StatusBadge status={b.status}/></td>
                    <td><StatusBadge status={b.payment_status}/></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:4 }}>
                        {b.status==='pending' && <>
                          <button className="btn-ghost" style={{ padding:'4px 8px', color:'var(--green)' }} onClick={() => updateStatus(b.id,'confirmed')} title="Confirm"><CheckCircle size={14} color="var(--green)"/></button>
                          <button className="btn-ghost" style={{ padding:'4px 8px' }} onClick={() => updateStatus(b.id,'rejected')} title="Reject"><XCircle size={14} color="var(--red)"/></button>
                        </>}
                        <button className="btn-ghost" style={{ padding:'4px 6px' }} onClick={() => setDelId(b.id)} title="Delete"><Trash2 size={13} color="var(--red)"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <Pagination page={page} total={total} limit={15} onChange={setPage}/>

      {/* Booking detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Booking ${selected?.reference}`} maxWidth={560}>
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['Customer',selected.customer_name],['Destination',`${selected.destination_emoji} ${selected.destination_name}`],['Check-in',selected.check_in],['Check-out',selected.check_out],['Guests',selected.guests],['Hotel',selected.hotel_name||'None'],['Total',kes(selected.total_amount)],['Method',selected.payment_method||'—']].map(([l,v]) => (
                <div key={l} style={{ background:'rgba(124,58,237,.05)', borderRadius:10, padding:'10px 14px', border:'1px solid rgba(124,58,237,.1)' }}>
                  <div style={{ fontSize:10, color:'var(--muted)', marginBottom:3 }}>{l}</div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8 }}>Status</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['pending','confirmed','completed','cancelled'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} className={selected.status===s?'btn-primary':'btn-outline'} style={{ fontSize:12, padding:'7px 14px', textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8 }}>Payment Status</div>
              <div style={{ display:'flex', gap:6 }}>
                {['unpaid','paid','refunded'].map(s => (
                  <button key={s} onClick={() => updatePayment(selected.id, s)} className={selected.payment_status===s?'btn-gold':'btn-outline'} style={{ fontSize:12, padding:'7px 14px', textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteBk} title="Delete Booking" message="This will permanently delete this booking." danger/>
    </div>
  );
}

/* ── DESTINATIONS ─────────────────────────────────── */
function DestinationsTab() {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId]   = useState(null);
  const BLANK = { name:'', country:'', region:'Africa', category:'Safari', emoji:'🌍', base_price:'', fallback_color:'#7c3aed', description:'' };
  const [form, setForm]     = useState(BLANK);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get('/destinations').then(r=>r&&r.json());
    if (r?.success) setList(r.destinations);
    setLoading(false);
  },[]);

  useEffect(() => { load(); },[load]);

  const openEdit = (d) => { setEditing(d); setForm({ name:d.name, country:d.country, region:d.region, category:d.category, emoji:d.emoji||'🌍', base_price:d.base_price, fallback_color:d.fallback_color||'#7c3aed', description:d.description||'' }); setModal(true); };
  const openAdd  = () => { setEditing(null); setForm(BLANK); setModal(true); };

  const save = async () => {
    if (!form.name||!form.country||!form.base_price) { toast('Name, country & price required','error'); return; }
    setSaving(true);
    const r = editing
      ? await api.patch(`/admin/destinations/${editing.id}`, form).then(r=>r&&r.json())
      : await api.post('/admin/destinations', form).then(r=>r&&r.json());
    if (r?.success) { toast(editing?'Destination updated':'Destination added','success'); setModal(false); load(); }
    else toast(r?.message||'Failed','error');
    setSaving(false);
  };

  const del = async () => {
    const r = await api.delete(`/admin/destinations/${delId}`).then(r=>r&&r.json());
    if (r?.success) { toast('Removed','success'); load(); }
    else toast(r?.message||'Failed','error');
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <span className="section-tag">MANAGE</span>
          <h2 className="serif" style={{ fontSize:30, fontWeight:700 }}>All <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Destinations</span></h2>
        </div>
        <button className="btn-primary" style={{ fontSize:13 }} onClick={openAdd}><Plus size={14}/> Add Destination</button>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32}/></div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {list.map(d => (
              <div key={d.id} className="card card-hover" style={{ overflow:'hidden' }}>
                <div style={{ position:'relative', height:120, background:`linear-gradient(135deg,${d.fallback_color||'#7c3aed'}55,${d.fallback_color||'#7c3aed'}22)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>
                  {d.emoji||'🌍'}
                  <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(124,58,237,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,.04) 1px, transparent 1px)', backgroundSize:'20px 20px' }}/>
                  <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:5 }}>
                    <button className="btn-ghost" style={{ padding:'5px 8px', background:'rgba(255,255,255,.85)', borderRadius:8 }} onClick={() => openEdit(d)}><Edit size={12}/></button>
                    <button className="btn-ghost" style={{ padding:'5px 8px', background:'rgba(255,255,255,.85)', borderRadius:8 }} onClick={() => setDelId(d.id)}><Trash2 size={12} color="var(--red)"/></button>
                  </div>
                </div>
                <div style={{ padding:'14px 15px' }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{d.name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginBottom:10 }}>{d.country} · {d.region}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className="badge badge-purple" style={{ fontSize:9 }}>{d.category}</span>
                    <span style={{ fontWeight:800, color:'#fbbf24', fontSize:14 }}>{kes(d.base_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      <Modal open={modal} onClose={() => setModal(false)} title={editing?'Edit Destination':'Add Destination'} maxWidth={520}>
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>NAME *</label><input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Nairobi"/></div>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>COUNTRY *</label><input className="inp" value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} placeholder="e.g. Kenya"/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 60px', gap:10 }}>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>REGION</label><select className="inp" value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}>{REGIONS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>CATEGORY</label><select className="inp" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>EMOJI</label><input className="inp" value={form.emoji} onChange={e=>setForm(p=>({...p,emoji:e.target.value}))} style={{ textAlign:'center', fontSize:20, padding:'8px 4px' }}/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>BASE PRICE (KES) *</label><input className="inp" type="number" value={form.base_price} onChange={e=>setForm(p=>({...p,base_price:e.target.value}))} placeholder="e.g. 150000"/></div>
            <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>CARD COLOR</label><div style={{ display:'flex', gap:7, alignItems:'center' }}><input type="color" value={form.fallback_color} onChange={e=>setForm(p=>({...p,fallback_color:e.target.value}))} style={{ width:40, height:40, borderRadius:8, border:'1px solid rgba(124,58,237,.2)', background:'none', cursor:'pointer', padding:3 }}/><input className="inp" value={form.fallback_color} onChange={e=>setForm(p=>({...p,fallback_color:e.target.value}))} placeholder="#7c3aed"/></div></div>
          </div>
          <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>DESCRIPTION</label><textarea className="inp" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Short description…" style={{ resize:'vertical' }}/></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button className="btn-outline" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?<Spinner size={14} color="#fff"/>:editing?'Save Changes':'Add Destination'}</button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Remove Destination" message="This destination will be hidden from customers." danger/>
    </div>
  );
}

/* ── USERS ────────────────────────────────────────── */
function UsersTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleF, setRoleF]     = useState('');
  const [delId, setDelId]     = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name:'', email:'', phone:'', password:'', role:'customer' });
  const [saving, setSaving]   = useState(false);
  const { user:me } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search',search);
    if (roleF)  p.set('role',roleF);
    const r = await api.get('/admin/users?'+p).then(r=>r&&r.json());
    if (r?.success) setList(r.users);
    setLoading(false);
  },[search, roleF]);

  useEffect(() => { load(); },[load]);

  const toggleStatus = async (u) => {
    const r = await api.patch(`/admin/users/${u.id}/status`,{is_active:!u.is_active}).then(r=>r&&r.json());
    if (r?.success) { toast(u.is_active?'User deactivated':'User activated','success'); load(); }
    else toast(r?.message||'Failed','error');
  };

  const toggleRole = async (u) => {
    const nr = u.role==='admin'?'customer':'admin';
    const r = await api.patch(`/admin/users/${u.id}/role`,{role:nr}).then(r=>r&&r.json());
    if (r?.success) { toast(`Role changed to ${nr}`,'success'); load(); }
    else toast(r?.message||'Failed','error');
  };

  const deleteUser = async () => {
    const r = await api.delete(`/admin/users/${delId}`).then(r=>r&&r.json());
    if (r?.success) { toast('User deleted','success'); load(); }
    else toast(r?.message||'Failed','error');
  };

  const addUser = async () => {
    if (!newUser.full_name||!newUser.email||!newUser.password) { toast('Name, email & password required','error'); return; }
    setSaving(true);
    const r = await api.post('/admin/users',newUser).then(r=>r&&r.json());
    if (r?.success) { toast('User created!','success'); setAddModal(false); setNewUser({ full_name:'',email:'',phone:'',password:'',role:'customer' }); load(); }
    else toast(r?.message||'Failed','error');
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <span className="section-tag">MANAGE</span>
          <h2 className="serif" style={{ fontSize:30, fontWeight:700 }}>All <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Users</span></h2>
        </div>
        <button className="btn-primary" style={{ fontSize:13 }} onClick={() => setAddModal(true)}><Plus size={14}/> Add User</button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.85)', border:'1px solid rgba(124,58,237,.18)', borderRadius:10, padding:'10px 14px', flex:'1 1 200px', maxWidth:300 }}>
          <Search size={14} color="var(--purple2)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, flex:1, fontFamily:'Plus Jakarta Sans,sans-serif' }}/>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {['','customer','admin'].map(r => (
            <button key={r} onClick={() => setRoleF(r)} className={`chip ${roleF===r?'active-purple':''}`} style={{ fontSize:11, textTransform:'capitalize' }}>{r||'All Roles'}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32}/></div>
        : list.length===0 ? <Empty icon="👤" title="No users found"/>
        : <div className="card" style={{ overflowX:'auto' }}>
            <table className="tbl" style={{ minWidth:720 }}>
              <thead><tr>{['Name','Email','Phone','Role','Bookings','Status','Joined','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {list.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight:600, fontSize:13 }}>{u.full_name}</td>
                    <td style={{ fontSize:12, color:'var(--muted)' }}>{u.email}</td>
                    <td style={{ fontSize:12, color:'var(--muted)' }}>{u.phone||'—'}</td>
                    <td><StatusBadge status={u.role}/></td>
                    <td style={{ textAlign:'center', fontSize:13, fontWeight:600 }}>{u.booking_count||0}</td>
                    <td><StatusBadge status={u.is_active?'active':'inactive'}/></td>
                    <td style={{ fontSize:11, color:'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        {u.id !== me?.id && <>
                          <button className="btn-ghost" style={{ padding:'4px 8px' }} title={u.is_active?'Deactivate':'Activate'} onClick={() => toggleStatus(u)}>{u.is_active?'🔴':'🟢'}</button>
                          <button className="btn-ghost" style={{ padding:'4px 8px' }} title={u.role==='admin'?'Make Customer':'Make Admin'} onClick={() => toggleRole(u)}><Shield size={12} color={u.role==='admin'?'#fbbf24':'var(--muted)'}/></button>
                          <button className="btn-ghost" style={{ padding:'4px 7px' }} title="Delete" onClick={() => setDelId(u.id)}><Trash2 size={12} color="var(--red)"/></button>
                        </>}
                        {u.id===me?.id && <span style={{ fontSize:10, color:'var(--purple2)', padding:'4px 8px' }}>You</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New User" maxWidth={440}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[['full_name','FULL NAME *','text','John Kamau'],['email','EMAIL *','email','john@example.com'],['phone','PHONE','tel','+254 7XX XXX XXX'],['password','PASSWORD *','password','Min 6 characters']].map(([k,l,t,ph]) => (
            <div key={k}><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>{l}</label><input className="inp" type={t} value={newUser[k]} onChange={e=>setNewUser(p=>({...p,[k]:e.target.value}))} placeholder={ph}/></div>
          ))}
          <div><label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:5 }}>ROLE</label><select className="inp" value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))}><option value="customer">Customer</option><option value="admin">Admin</option></select></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button className="btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={addUser} disabled={saving}>{saving?<Spinner size={14} color="#fff"/>:'Create User'}</button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={deleteUser} title="Delete User" message="This will permanently delete this user and all their sessions." danger/>
    </div>
  );
}

/* ── ANALYTICS ────────────────────────────────────── */
function AnalyticsTab() {
  const [chart, setChart]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r=>r&&r.json()).then(d => {
      if (d?.success) { setStats(d.stats); setChart(d.revenueChart||[]); }
      setLoading(false);
    });
  },[]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32}/></div>;

  const MOCK = [{month:'Sep',revenue:5460000,bookings:12},{month:'Oct',revenue:7540000,bookings:17},{month:'Nov',revenue:4550000,bookings:10},{month:'Dec',revenue:11310000,bookings:24},{month:'Jan',revenue:8450000,bookings:19},{month:'Feb',revenue:9620000,bookings:22}];
  const data = chart.length
    ? chart.map(c => ({ month:new Date(c.month).toLocaleDateString('en',{month:'short'}), revenue:parseInt(c.revenue)||0, bookings:parseInt(c.bookings)||0 }))
    : MOCK;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <span className="section-tag">INSIGHTS</span>
        <h2 className="serif" style={{ fontSize:30, fontWeight:700 }}>Business <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Analytics</span></h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Revenue',     val:kes(stats?.totalRevenue||0),   c:'#f59e0b', bg:'rgba(245,158,11,.12)' },
          { label:'Total Bookings',    val:stats?.totalBookings||0,        c:'#a78bfa', bg:'rgba(124,58,237,.12)' },
          { label:'Total Customers',   val:stats?.totalCustomers||0,       c:'#34d399', bg:'rgba(16,185,129,.12)' },
          { label:'Avg Booking Value', val:stats?.totalBookings?kes(Math.round((stats.totalRevenue||0)/stats.totalBookings)):'N/A', c:'#22d3ee', bg:'rgba(6,182,212,.12)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.c, fontFamily:'Fraunces,serif', marginBottom:6 }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card" style={{ padding:20 }}>
          <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Monthly Revenue (KES)</h4>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data}>
              <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9}/><stop offset="100%" stopColor="#6d28d9" stopOpacity={0.6}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,.08)"/>
              <XAxis dataKey="month" stroke="var(--muted)" fontSize={11}/>
              <YAxis stroke="var(--muted)" fontSize={10} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`}/>
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid rgba(124,58,237,.25)', borderRadius:10, color:'var(--text)', fontSize:12 }} formatter={v=>kes(v)}/>
              <Bar dataKey="revenue" fill="url(#bg)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:20 }}>
          <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Monthly Bookings (count)</h4>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9}/><stop offset="100%" stopColor="#0891b2" stopOpacity={0.6}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,.08)"/>
              <XAxis dataKey="month" stroke="var(--muted)" fontSize={11}/>
              <YAxis stroke="var(--muted)" fontSize={11}/>
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid rgba(6,182,212,.25)', borderRadius:10, color:'var(--text)', fontSize:12 }}/>
              <Bar dataKey="bookings" fill="url(#cg)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}