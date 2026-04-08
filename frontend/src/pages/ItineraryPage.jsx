import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Users, Calendar, Sparkles, ChevronRight, Bot, Wallet } from 'lucide-react';
import { kes, Spinner } from '../components/UI';
import api from '../api';

export default function ItineraryPage() {
  const [dests, setDests]   = useState([]);
  const [destId, setDestId] = useState('');
  const [days, setDays]     = useState(5);
  const [ppl, setPpl]       = useState(2);
  const [budget, setBudget] = useState('mid');
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/destinations').then(r => r && r.json()).then(d => { if (d?.success) setDests(d.destinations); });
  }, []);

  const generate = () => {
    const d = dests.find(x => String(x.id) === String(destId));
    if (!d) return;
    setLoading(true);
    setTimeout(() => {
      const hotels = d.hotels || [];
      const hotel = budget==='luxury' ? hotels[0] : budget==='mid' ? hotels[1]||hotels[0] : hotels[hotels.length-1]||hotels[0];
      const activities = d.activities || [];
      const dayPlans = Array.from({ length: days }, (_, i) => {
        const act = activities[i % Math.max(activities.length, 1)];
        return {
          day: i+1,
          title: i===0 ? 'Arrival & First Impressions' : i===days-1 ? 'Farewell & Departure' : `Day ${i+1} — Exploration`,
          hotel: hotel?.name || 'Hotel TBD',
          activity: act,
          cost: ((hotel?.price_per_night||0) + (act?.price||0)) * ppl,
        };
      });
      setPlan({ dest:d, days:dayPlans, total:dayPlans.reduce((s,x)=>s+x.cost,0), ppl });
      setLoading(false);
    }, 800);
  };

  const BUDGET_OPTS = [
    { val:'budget', ico:'', lbl:'Budget', desc:'Best value' },
    { val:'mid',    ico:'', lbl:'Mid-Range', desc:'Comfort' },
    { val:'luxury', ico:'', lbl:'Luxury', desc:'Premium' },
  ];

  const DAY_EMOJIS = ['','','','','','','','','','','','','','',''];

  return (
    <div className="page mesh-bg">
      <div className="container" style={{ padding:'36px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <span className="section-tag">TRIP PLANNER</span>
          <h1 className="serif" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, marginBottom:8 }}>
            Plan Your <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Itinerary</span>
          </h1>
          <p style={{ color:'var(--muted2)', fontSize:14 }}>
            Generate a day-by-day travel plan, or{' '}
            <button onClick={() => nav('/chat')} style={{ color:'#a78bfa', background:'none', border:'none', cursor:'pointer', fontSize:14, textDecoration:'underline', fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:600 }}>
              ask our AI assistant 
            </button>{' '}for personalised advice.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,300px) 1fr', gap:22, alignItems:'start' }}>
          {/* Config panel */}
          <div className="card" style={{ padding:24, position:'sticky', top:76 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,rgba(124,58,237,.25),rgba(6,182,212,.15))', display:'flex', alignItems:'center', justifyContent:'center' }}><Map size={15} color="#a78bfa"/></div>
              Configure Trip
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:7, fontWeight:600, letterSpacing:.5 }}>DESTINATION</label>
                <select value={destId} onChange={e => setDestId(e.target.value)} className="inp">
                  <option value="">Choose destination…</option>
                  {dests.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}, {d.country}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:7, fontWeight:600, letterSpacing:.5 }}>DAYS</label>
                  <select value={days} onChange={e => setDays(+e.target.value)} className="inp">
                    {[3,4,5,7,10,14].map(n => <option key={n} value={n}>{n} Days</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:7, fontWeight:600, letterSpacing:.5 }}>TRAVELLERS</label>
                  <select value={ppl} onChange={e => setPpl(+e.target.value)} className="inp">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:10, fontWeight:600, letterSpacing:.5 }}>BUDGET LEVEL</label>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {BUDGET_OPTS.map(b => (
                    <button key={b.val} onClick={() => setBudget(b.val)} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:10, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all .2s', textAlign:'left',
                      background: budget===b.val ? 'rgba(124,58,237,.12)' : '#ffffff',
                      border: budget===b.val ? '1px solid rgba(124,58,237,.4)' : '1px solid #e5e7eb',
                    }}>
                      <span style={{ fontSize:22 }}>{b.ico}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color: budget===b.val ? '#a78bfa' : 'var(--text)' }}>{b.lbl}</div>
                        <div style={{ fontSize:11, color:'var(--muted)' }}>{b.desc}</div>
                      </div>
                      {budget===b.val && <div style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background:'#7c3aed', boxShadow:'0 0 8px #7c3aed' }}/>}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={generate} disabled={!destId || loading} style={{ width:'100%', padding:13, borderRadius:12, fontSize:14 }}>
                {loading ? <><Spinner size={16} color="#fff"/> Generating…</> : <><Sparkles size={16}/> Generate Plan</>}
              </button>
              <button className="btn-outline" onClick={() => nav('/chat')} style={{ width:'100%', padding:12, borderRadius:12, fontSize:13 }}>
                <Bot size={14}/> Ask AI Instead
              </button>
            </div>
          </div>

          {/* Plan output */}
          <div>
            {!plan ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:380, textAlign:'center', background:'#f9fafb', border:'2px dashed #e5e7eb', borderRadius:16, padding:40 }}>
                <div style={{ fontSize:64, marginBottom:18, filter:'drop-shadow(0 0 20px rgba(124,58,237,.3))' }}></div>
                <h3 className="serif" style={{ fontSize:24, marginBottom:10, fontWeight:600, color:'#111827' }}>Your Itinerary Awaits</h3>
                <p style={{ color:'var(--muted)', fontSize:14, maxWidth:300, lineHeight:1.7 }}>Select a destination, set your preferences, and click Generate Plan</p>
              </div>
            ) : (
              <div className="fade-up">
                {/* Summary card */}
                <div style={{ background:'linear-gradient(135deg,rgba(124,58,237,.15),rgba(6,182,212,.08))', border:'1px solid rgba(124,58,237,.25)', borderRadius:16, padding:22, marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div className="serif" style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>{plan.dest.emoji} {plan.dest.name} — {days}-Day Plan</div>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13, color:'var(--muted2)' }}>
                        <span><Users size={13} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }}/>{ppl} traveller{ppl!==1?'s':''}</span>
                        <span><Calendar size={13} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }}/>{days} days</span>
                        <span><Wallet size={13} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }}/>Budget: {budget}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:3 }}>Estimated Total</div>
                      <div style={{ fontSize:26, fontWeight:800, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'Fraunces,serif' }}>{kes(plan.total)}</div>
                    </div>
                  </div>
                </div>

                {/* Day cards */}
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
                  {plan.days.map(d => (
                    <div key={d.day} className="card" style={{ overflow:'hidden', transition:'all .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(124,58,237,.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(124,58,237,.12)'}>
                      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(124,58,237,.08)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(124,58,237,.04)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', boxShadow:'0 4px 12px rgba(124,58,237,.4)' }}>{d.day}</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14 }}>{DAY_EMOJIS[d.day-1] || ''} {d.title}</div>
                            <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Day {d.day} of {days}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight:800, fontSize:15, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{kes(d.cost)}</div>
                      </div>
                      <div style={{ padding:'12px 18px', display:'flex', gap:20, flexWrap:'wrap', fontSize:13 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:18 }}></span>
                          <div><div style={{ fontSize:10, color:'var(--muted)', marginBottom:2 }}>ACCOMMODATION</div><div style={{ fontWeight:600 }}>{d.hotel}</div></div>
                        </div>
                        {d.activity && (
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:18 }}>{d.activity.emoji || ''}</span>
                            <div>
                              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:2 }}>ACTIVITY</div>
                              <div style={{ fontWeight:600 }}>{d.activity.name} <span style={{ color:'#fbbf24', fontSize:12 }}>· {kes(d.activity.price)}/p</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-primary" onClick={() => nav('/book')} style={{ padding:'14px 32px', borderRadius:12, fontSize:15 }}>
                  Book This Trip <ChevronRight size={16}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}