import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Shield, Star, Clock, Users, Calendar, CreditCard, Smartphone, MapPin, Sparkles } from 'lucide-react';
import { DestImg, kes, Spinner, toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STEPS = [
  { n:1, label:'Destination', icon:'' },
  { n:2, label:'Hotel',       icon:'' },
  { n:3, label:'Activities',  icon:'' },
  { n:4, label:'Details',     icon:'' },
  { n:5, label:'Payment',     icon:'' },
];

export default function BookingPage() {
  const { state } = useLocation();
  const { user } = useAuth();
  const nav = useNavigate();

  const [dests, setDests]   = useState([]);
  const [dest, setDest]     = useState(state?.dest || null);
  const [hotel, setHotel]   = useState(null);
  const [acts, setActs]     = useState([]);
  const [step, setStep]     = useState(state?.dest ? 2 : 1);
  const [checkIn, setCI]    = useState('');
  const [checkOut, setCO]   = useState('');
  const [guests, setGuests] = useState(2);
  const [payMethod, setPay] = useState('mpesa');
  const [mpesa, setMpesa]   = useState(user?.phone || '');
  const [card, setCard]     = useState({ num:'', name:'', exp:'', cvv:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/destinations').then(r => r && r.json()).then(d => { if (d?.success) setDests(d.destinations); });
  }, []);

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut)-new Date(checkIn))/86400000)) : 1;
  const hotelCost = hotel ? hotel.price_per_night * nights * guests : 0;
  const actCost   = acts.reduce((s,a) => s + a.price * guests, 0);
  const total     = hotelCost + actCost;
  const toggleAct = a => setActs(p => p.find(x=>x.id===a.id) ? p.filter(x=>x.id!==a.id) : [...p,a]);

  const submit = async () => {
    if (!checkIn || !checkOut) { setError('Please select check-in and check-out dates.'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/bookings', { destination_id:dest.id, hotel_id:hotel?.id, check_in:checkIn, check_out:checkOut, guests, activity_ids:acts.map(a=>a.id), payment_method:payMethod, mpesa_phone:payMethod==='mpesa'?mpesa:null });
      const d = await r.json();
      if (d.success) { setDone(d); toast('Booking confirmed! ', 'success'); }
      else setError(d.message);
    } catch { setError('Could not submit. Please try again.'); }
    setLoading(false);
  };

  // Success screen
  if (done) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 20px', background:'var(--bg)' }}>
      <div className="fade-up" style={{ textAlign:'center', maxWidth:480, width:'100%' }}>
        <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,rgba(16,185,129,.2),rgba(16,185,129,.08))', border:'2px solid rgba(16,185,129,.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 0 40px rgba(16,185,129,.2)' }}>
          <Check size={40} color="#10b981"/>
        </div>
        <div className="serif" style={{ fontSize:40, fontWeight:700, marginBottom:8 }}>Booking Confirmed! </div>
        <p style={{ color:'var(--muted2)', marginBottom:28, fontSize:15 }}>Your trip to {dest?.name} is all set!</p>
        <div style={{ background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.2)', borderRadius:14, padding:'18px 24px', marginBottom:24 }}>
          <div style={{ fontSize:11, color:'var(--muted)', letterSpacing:2, marginBottom:6 }}>BOOKING REFERENCE</div>
          <div className="serif" style={{ fontSize:36, color:'#34d399', letterSpacing:4, fontWeight:700 }}>{done.reference}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28, textAlign:'left' }}>
          {[['Destination',`${dest?.emoji} ${dest?.name}`],['Total',kes(total)],['Guests',`${guests} people`],['Nights',`${nights} nights`]].map(([l,v]) => (
            <div key={l} className="card" style={{ padding:'12px 16px' }}>
              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:4 }}>{l}</div>
              <div style={{ fontWeight:700, fontSize:14, color:l==='Total'?'#fbbf24':'var(--text)' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-primary" style={{ flex:1, padding:13 }} onClick={() => nav('/')}>Back to Home</button>
          <button className="btn-outline" style={{ flex:1, padding:13 }} onClick={() => nav('/itinerary')}>Plan Itinerary</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page mesh-bg">
      <div className="container" style={{ padding:'32px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <span className="section-tag">BOOKING</span>
          <h1 className="serif" style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:700, marginBottom:6 }}>
            Book Your <span style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Trip</span>
          </h1>
          <p style={{ color:'var(--muted2)', fontSize:14 }}>Booking as <strong style={{ color:'#a78bfa' }}>{user?.full_name}</strong></p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:28, overflowX:'auto', paddingBottom:4 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display:'flex', alignItems:'center', flex:i<STEPS.length-1?1:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0, cursor: s.n < step ? 'pointer' : 'default' }} onClick={() => s.n < step && setStep(s.n)}>
                <div style={{
                  width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, flexShrink:0, transition:'all .3s',
                  background: step>s.n ? 'linear-gradient(135deg,#10b981,#059669)' : step===s.n ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,.85)',
                  border: step===s.n ? 'none' : step>s.n ? 'none' : '1px solid rgba(124,58,237,.2)',
                  boxShadow: step===s.n ? '0 4px 15px rgba(124,58,237,.4)' : step>s.n ? '0 4px 12px rgba(16,185,129,.3)' : 'none',
                  color: step>=s.n ? '#fff' : 'var(--muted)',
                }}>
                  {step>s.n ? <Check size={15}/> : <span style={{ fontSize:14 }}>{s.icon}</span>}
                </div>
                <span className="hide-sm" style={{ fontSize:11, fontWeight:step===s.n?700:400, color:step===s.n?'#a78bfa':step>s.n?'#34d399':'var(--muted)', whiteSpace:'nowrap' }}>{s.label}</span>
              </div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:2, margin:'0 8px', borderRadius:1, background:step>s.n?'rgba(16,185,129,.4)':'rgba(124,58,237,.12)', transition:'background .3s', minWidth:16 }}/>}
            </div>
          ))}
        </div>

        <div className="booking-layout">
          {/* Main panel */}
          <div className="card" style={{ padding:'clamp(18px,3vw,28px)' }}>
            {error && (
              <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:13, color:'#f87171', display:'flex', alignItems:'center', gap:8 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Step 1: Destination */}
            {step===1 && (
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Choose Destination</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:18 }}>Select where you want to travel</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
                  {dests.map(d => (
                    <div key={d.id} onClick={() => setDest(d)} style={{
                      borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'all .25s',
                      border: dest?.id===d.id ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,.1)',
                      boxShadow: dest?.id===d.id ? '0 0 20px rgba(124,58,237,.3)' : 'none',
                    }}>
                      <div style={{ position:'relative', height:90, overflow:'hidden' }}>
                        <DestImg dest={d}/>
                        <div className="img-overlay" style={{ position:'absolute', inset:0 }}/>
                        {dest?.id===d.id && <div style={{ position:'absolute', top:6, right:6, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(124,58,237,.5)' }}><Check size={12} color="#fff"/></div>}
                        <div style={{ position:'absolute', bottom:6, left:10, right:8, color:'#fff', textShadow:'0 1px 4px rgba(0,0,0,.85)' }}>
                          <div style={{ fontSize:12, fontWeight:700 }}>{d.name}</div>
                          <div style={{ fontSize:10, color:'#fde68a', fontWeight:600 }}>{kes(d.base_price)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Hotel */}
            {step===2 && dest && (
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Hotels in {dest.name}</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:18 }}>Select your accommodation</p>
                {(!dest.hotels||dest.hotels.length===0) ? (
                  <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>🏨 No hotels listed yet for this destination.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {dest.hotels.map(h => (
                      <div key={h.id} onClick={() => setHotel(h)} style={{
                        padding:18, borderRadius:12, cursor:'pointer', transition:'all .25s',
                        border: hotel?.id===h.id ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,.12)',
                        background: hotel?.id===h.id ? 'rgba(124,58,237,.08)' : 'rgba(255,255,255,.75)',
                        boxShadow: hotel?.id===h.id ? '0 0 20px rgba(124,58,237,.2)' : 'none',
                      }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{h.name}</div>
                            <div style={{ display:'flex', gap:2, marginBottom:8 }}>
                              {Array(Math.min(h.stars||4,5)).fill(0).map((_,i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b"/>)}
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                              {(h.amenities||[]).map(a => <span key={a} style={{ fontSize:10, color:'var(--muted2)', background:'rgba(124,58,237,.08)', padding:'3px 8px', borderRadius:6, border:'1px solid rgba(124,58,237,.12)' }}>{a}</span>)}
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontSize:18, fontWeight:800, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{kes(h.price_per_night)}</div>
                            <div style={{ fontSize:10, color:'var(--muted)', marginBottom:8 }}>/night/person</div>
                            {hotel?.id===h.id && <span className="badge badge-purple" style={{ fontSize:9 }}>✓ Selected</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Activities */}
            {step===3 && dest && (
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Add Activities</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:18 }}>Optional — enhance your trip with local experiences</p>
                {(!dest.activities||dest.activities.length===0) ? (
                  <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}> No activities listed yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {dest.activities.map(a => {
                      const sel = acts.find(x => x.id===a.id);
                      return (
                        <div key={a.id} onClick={() => toggleAct(a)} style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px',
                          borderRadius:12, cursor:'pointer', transition:'all .25s',
                          border: sel ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,.12)',
                          background: sel ? 'rgba(124,58,237,.08)' : 'rgba(255,255,255,.75)',
                        }}>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <span style={{ fontSize:30 }}>{a.emoji}</span>
                            <div>
                              <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{a.name}</div>
                              <div style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:4 }}><Clock size={10}/>{a.duration}</div>
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontWeight:700, fontSize:14, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{kes(a.price)}</div>
                              <div style={{ fontSize:10, color:'var(--muted)' }}>/person</div>
                            </div>
                            <div style={{ width:24, height:24, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', background:sel?'linear-gradient(135deg,#7c3aed,#6d28d9)':'rgba(124,58,237,.06)', border:sel?'none':'1px solid rgba(124,58,237,.2)' }}>
                              {sel && <Check size={13} color="#fff"/>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Details */}
            {step===4 && (
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Trip Details</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:22 }}>Set your travel dates and group size</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                  <div>
                    <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600, letterSpacing:.5 }}>CHECK-IN DATE</label>
                    <input type="date" className="inp" value={checkIn} onChange={e => setCI(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600, letterSpacing:.5 }}>CHECK-OUT DATE</label>
                    <input type="date" className="inp" value={checkOut} onChange={e => setCO(e.target.value)} min={checkIn||new Date().toISOString().split('T')[0]}/>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:10, fontWeight:600, letterSpacing:.5 }}>NUMBER OF GUESTS</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => setGuests(n)} style={{
                        width:46, height:46, borderRadius:10, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:16, transition:'all .2s',
                        background: guests===n ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,.85)',
                        border: guests===n ? 'none' : '1px solid rgba(124,58,237,.2)',
                        color: guests===n ? '#fff' : 'var(--text)',
                        boxShadow: guests===n ? '0 4px 15px rgba(124,58,237,.4)' : 'none',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                {checkIn && checkOut && nights > 0 && (
                  <div style={{ marginTop:18, padding:'14px 18px', background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12, fontSize:13, color:'#34d399', display:'flex', alignItems:'center', gap:8 }}>
                    <Check size={16}/> {nights} night{nights!==1?'s':''} · {guests} guest{guests!==1?'s':''} confirmed
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Payment */}
            {step===5 && (
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Payment</h3>
                <p style={{ color:'var(--muted)', fontSize:13, marginBottom:22 }}>Choose your payment method</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22 }}>
                  {[['mpesa','📱','M-Pesa','Safaricom STK Push'],['card','💳','Card','Visa / Mastercard']].map(([v,ico,lbl,sub]) => (
                    <div key={v} onClick={() => setPay(v)} style={{
                      padding:'18px 16px', textAlign:'center', cursor:'pointer', borderRadius:14, transition:'all .25s',
                      border: payMethod===v ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,.12)',
                      background: payMethod===v ? 'rgba(124,58,237,.1)' : 'rgba(255,255,255,.75)',
                      boxShadow: payMethod===v ? '0 0 20px rgba(124,58,237,.2)' : 'none',
                    }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>{ico}</div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{lbl}</div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>{sub}</div>
                      {payMethod===v && <div style={{ marginTop:8 }}><span className="badge badge-purple" style={{ fontSize:9 }}>✓ Selected</span></div>}
                    </div>
                  ))}
                </div>
                {payMethod==='mpesa' && (
                  <div>
                    <div style={{ background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12, padding:16, marginBottom:16 }}>
                      <p style={{ fontSize:13, color:'var(--muted2)', lineHeight:1.7 }}>
                        <Smartphone size={14} style={{ display:'inline', marginRight:6, verticalAlign:'middle', color:'#34d399' }}/>
                        You'll receive an M-Pesa prompt for <strong style={{ color:'#fbbf24' }}>{kes(total)}</strong> on your Safaricom number.
                      </p>
                    </div>
                    <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600, letterSpacing:.5 }}>MPESA PHONE NUMBER</label>
                    <input className="inp" value={mpesa} onChange={e => setMpesa(e.target.value)} placeholder="+254 7XX XXX XXX"/>
                  </div>
                )}
                {payMethod==='card' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600 }}>CARD NUMBER</label>
                      <input className="inp" value={card.num} onChange={e => setCard(p=>({...p,num:e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)}))} placeholder="1234 5678 9012 3456"/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600 }}>CARDHOLDER NAME</label>
                      <input className="inp" value={card.name} onChange={e => setCard(p=>({...p,name:e.target.value}))} placeholder="John Kamau"/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600 }}>EXPIRY</label>
                        <input className="inp" value={card.exp} onChange={e => setCard(p=>({...p,exp:e.target.value}))} placeholder="MM/YY" maxLength={5}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, color:'var(--muted)', display:'block', marginBottom:8, fontWeight:600 }}>CVV</label>
                        <input className="inp" type="password" value={card.cvv} onChange={e => setCard(p=>({...p,cvv:e.target.value}))} placeholder="•••" maxLength={4}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="booking-sidebar">
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'var(--purple2)', marginBottom:16, textTransform:'uppercase' }}>Trip Summary</div>
              {dest && (
                <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', background:'rgba(124,58,237,.06)', borderRadius:10, padding:12, border:'1px solid rgba(124,58,237,.12)' }}>
                  <div style={{ width:46, height:46, borderRadius:10, overflow:'hidden', flexShrink:0 }}><DestImg dest={dest}/></div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{dest.emoji} {dest.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:3 }}><MapPin size={9}/>{dest.country}</div>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8, paddingTop:4 }}>
                {hotel && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, padding:'6px 0', borderBottom:'1px solid rgba(124,58,237,.07)' }}>
                    <span style={{ color:'var(--muted2)' }}> Hotel ×{nights}n ×{guests}p</span>
                    <span style={{ fontWeight:700, color:'#fbbf24' }}>{kes(hotelCost)}</span>
                  </div>
                )}
                {acts.map(a => (
                  <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, padding:'6px 0', borderBottom:'1px solid rgba(124,58,237,.07)' }}>
                    <span style={{ color:'var(--muted2)' }}>{a.emoji} {a.name.slice(0,18)}{a.name.length>18?'…':''}</span>
                    <span style={{ fontWeight:700, color:'#fbbf24' }}>{kes(a.price*guests)}</span>
                  </div>
                ))}
                {checkIn && checkOut && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--muted)', padding:'4px 0' }}>
                    <span><Calendar size={10} style={{ display:'inline', marginRight:3 }}/>{nights} night{nights!==1?'s':''}</span>
                    <span><Users size={10} style={{ display:'inline', marginRight:3 }}/>{guests} guest{guests!==1?'s':''}</span>
                  </div>
                )}
              </div>
              <div style={{ borderTop:'1px solid rgba(124,58,237,.15)', marginTop:14, paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Total</span>
                <span style={{ fontSize:20, fontWeight:800, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'Fraunces,serif' }}>{kes(total)}</span>
              </div>

              {/* Nav buttons */}
              <div style={{ display:'flex', gap:8, marginTop:16 }}>
                {step > 1 && <button className="btn-outline" style={{ flex:1, padding:'10px 0', borderRadius:10 }} onClick={() => setStep(s=>s-1)}><ChevronLeft size={15}/></button>}
                {step < 5 ? (
                  <button className="btn-primary" style={{ flex:2, padding:'10px 0', borderRadius:10 }} onClick={() => setStep(s=>s+1)}
                    disabled={(step===1&&!dest)||(step===4&&(!checkIn||!checkOut))}>
                    Next <ChevronRight size={15}/>
                  </button>
                ) : (
                  <button className="btn-gold" style={{ flex:2, padding:'10px 0', borderRadius:10, fontSize:13, fontWeight:800 }} onClick={submit} disabled={loading}>
                    {loading ? <><Spinner size={14} color="#06041a"/> Processing…</> : <><Shield size={14}/> Pay {kes(total)}</>}
                  </button>
                )}
              </div>
              {step===5 && <div style={{ textAlign:'center', fontSize:10, color:'var(--muted)', marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><Shield size={9}/>Secured · Encrypted payment</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}