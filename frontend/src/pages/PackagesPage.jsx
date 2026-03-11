import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { DestImg, kes, Spinner } from '../components/UI';
import api from '../api';

const REGIONS = ['All','Africa','Europe','Asia','Americas','Middle East','Oceania'];
const CATS    = ['All','Safari','Beach','City','Culture','Adventure','Romance','Luxury'];

export default function PackagesPage() {
  const [dests, setDests]   = useState([]);
  const [region, setRegion] = useState('All');
  const [cat, setCat]       = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('rating');
  const [loading, setLoading] = useState(true);
  const [sp] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    if (sp.get('cat')) setCat(sp.get('cat'));
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (region !== 'All') p.set('region', region);
    if (cat !== 'All') p.set('category', cat);
    if (search) p.set('search', search);
    api.get('/destinations?' + p)
      .then(r => r && r.json())
      .then(d => {
        if (!d?.success) return;
        let list = [...d.destinations];
        if (sort==='price')   list.sort((a,b) => a.base_price - b.base_price);
        if (sort==='price-d') list.sort((a,b) => b.base_price - a.base_price);
        setDests(list);
      }).finally(() => setLoading(false));
  }, [region, cat, search, sort]);

  return (
    <div className="page mesh-bg">
      {/* Header */}
      <div style={{ borderBottom:'1px solid rgba(124,58,237,.1)', padding:'32px 0 24px', background:'rgba(6,4,26,.5)' }}>
        <div className="container">
          <span className="section-tag">EXPLORE</span>
          <h1 className="serif" style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:700, marginBottom:6 }}>
            All <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Packages</span>
          </h1>
          <p style={{ color:'var(--muted2)', fontSize:14, marginBottom:24 }}>{dests.length} destinations worldwide · All prices in KES</p>

          {/* Filters */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(13,10,46,.9)', border:'1px solid rgba(124,58,237,.2)', borderRadius:10, padding:'10px 14px', flex:'1 1 220px', maxWidth:320 }}>
              <Search size={15} color="var(--purple2)"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations…" style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, flex:1, fontFamily:'Plus Jakarta Sans,sans-serif' }}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(13,10,46,.9)', border:'1px solid rgba(124,58,237,.15)', borderRadius:10, padding:'0 14px', height:44 }}>
              <SlidersHorizontal size={14} color="var(--muted)"/>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                <option value="rating" style={{ background:'#0c0a2e' }}>Top Rated</option>
                <option value="price" style={{ background:'#0c0a2e' }}>Price: Low → High</option>
                <option value="price-d" style={{ background:'#0c0a2e' }}>Price: High → Low</option>
              </select>
            </div>
          </div>

          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
            {REGIONS.map(r => <button key={r} onClick={() => setRegion(r)} className={`chip ${region===r?'active-purple':''}`} style={{ fontSize:11 }}>{r}</button>)}
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`chip ${cat===c?'active-cyan':''}`} style={{ fontSize:11 }}>{c}</button>)}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding:'28px 20px 80px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36}/></div>
        ) : dests.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>No results found</h3>
            <p style={{ color:'var(--muted)', fontSize:14 }}>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
            {dests.map(d => (
              <div key={d.id} className="card card-hover" style={{ cursor:'pointer', overflow:'hidden' }} onClick={() => nav('/book', { state:{dest:d} })}>
                <div style={{ position:'relative', height:200, overflow:'hidden' }}>
                  <DestImg dest={d}/>
                  <div className="img-overlay" style={{ position:'absolute', inset:0 }}/>
                  <div style={{ position:'absolute', top:12, left:12 }}>
                    <span className="badge badge-purple" style={{ fontSize:9, backdropFilter:'blur(8px)' }}>{d.category}</span>
                  </div>
                  <div style={{ position:'absolute', top:10, right:10, background:'rgba(6,4,26,.75)', borderRadius:20, padding:'4px 10px', fontSize:12, display:'flex', alignItems:'center', gap:3, backdropFilter:'blur(8px)' }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b"/> {d.rating}
                  </div>
                  <div style={{ position:'absolute', bottom:12, left:14 }}>
                    <div className="serif" style={{ fontSize:20, fontWeight:600 }}>{d.emoji} {d.name}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', display:'flex', alignItems:'center', gap:4 }}><MapPin size={9}/>{d.country}</div>
                  </div>
                </div>
                <div style={{ padding:'14px 16px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span className="badge badge-cyan" style={{ fontSize:9 }}>{d.region}</span>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>from</div>
                      <div style={{ fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{kes(d.base_price)}</div>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width:'100%', fontSize:13, padding:'10px', borderRadius:10 }}>
                    Book Now <ChevronRight size={13}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}