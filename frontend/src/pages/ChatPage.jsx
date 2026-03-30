import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { Spinner } from '../components/UI';
import api from '../api';

const SUGGESTIONS = [
  ' Best time for Masai Mara?',
  ' 7 days Bali budget in KES?',
  ' Visa for Dubai from Kenya?',
  ' Romantic destinations under KES 300K?',
  ' Adventure trips available?',
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState([
    { role:'assistant', content:'👋 Hello! I\'m your **WorldTrips AI Travel Assistant**.\n\nI can help you with:\n**• Destinations** — recommendations & info\n**• Budgets** — all prices in KES\n**• Visas** — requirements for Kenyan travellers\n**• Itineraries** — day-by-day planning\n**• Hotels & Activities** — what to book\n\nWhere would you like to travel? ' }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg = { role:'user', content:msg };
    setMsgs(p => [...p, userMsg]);
    setInput(''); setLoading(true);
    try {
      const apiMsgs = [...msgs.slice(-10), userMsg].map(m => ({ role:m.role, content:m.content }));
      const r = await api.post('/chat', { messages: apiMsgs });
      const d = await r.json();
      setMsgs(p => [...p, { role:'assistant', content: d.reply || 'Sorry, no response.' }]);
    } catch {
      setMsgs(p => [...p, { role:'assistant', content:'Connection issue. Please try again.' }]);
    }
    setLoading(false);
  };

  const formatMsg = (text) => text.split('\n').map((line, i) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fbbf24;font-weight:600">$1</strong>')
      .replace(/•/g, '<span style="color:#7c3aed">•</span>');
    return <div key={i} style={{ marginBottom:3, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html:html }}/>;
  });

  return (
    <div style={{ height:'100vh', paddingTop:64, background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <div style={{ maxWidth:780, margin:'0 auto', width:'100%', height:'100%', display:'flex', flexDirection:'column', padding:'0 16px' }}>

        {/* Header */}
        <div style={{ padding:'16px 0 14px', borderBottom:'1px solid rgba(124,58,237,.12)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:'linear-gradient(135deg,rgba(124,58,237,.25),rgba(6,182,212,.15))', border:'1px solid rgba(124,58,237,.3)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,58,237,.2)' }}>
              <Bot size={22} color="#a78bfa"/>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>WorldTrips AI Assistant</div>
              <div style={{ fontSize:11, color:'var(--green)', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)' }}/> Online · Ready to help
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:20, fontSize:11, color:'var(--purple2)' }}>
            <Sparkles size={11}/> AI Powered
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 0', display:'flex', flexDirection:'column', gap:16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:10, alignItems:'flex-end' }}>
              {m.role==='assistant' && (
                <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2))', border:'1px solid rgba(124,58,237,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Bot size={15} color="#a78bfa"/>
                </div>
              )}
              <div style={{
                maxWidth:'78%', fontSize:13.5, lineHeight:1.65, padding:'13px 16px',
                borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                background: m.role==='user'
                  ? 'linear-gradient(135deg,rgba(124,58,237,.25),rgba(109,40,217,.15))'
                  : 'rgba(255,255,255,.88)',
                border: m.role==='user'
                  ? '1px solid rgba(124,58,237,.35)'
                  : '1px solid rgba(124,58,237,.1)',
                boxShadow:'0 4px 15px rgba(0,0,0,.2)',
              }}>
                {formatMsg(m.content)}
              </div>
              {m.role==='user' && (
                <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(124,58,237,.4)' }}>
                  <User size={15} color="#fff"/>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.2))', border:'1px solid rgba(124,58,237,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bot size={15} color="#a78bfa"/>
              </div>
              <div style={{ padding:'14px 18px', background:'rgba(255,255,255,.88)', borderRadius:'4px 18px 18px 18px', border:'1px solid rgba(124,58,237,.1)', display:'flex', gap:6, alignItems:'center' }}>
                {[0,1,2].map(j => <div key={j} style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', animation:`pulse ${1.1+j*.2}s ease-in-out infinite`, animationDelay:j*.15+'s', opacity:.7 }}/>)}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Suggestions */}
        {msgs.length <= 1 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingBottom:10 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ padding:'7px 13px', borderRadius:20, fontSize:12, cursor:'pointer', background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.25)', color:'var(--purple2)', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,.2)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,.1)'}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding:'10px 0 18px', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8, background:'rgba(255,255,255,.9)', border:'1px solid rgba(124,58,237,.25)', borderRadius:14, padding:'8px 8px 8px 16px', alignItems:'flex-end', boxShadow:'0 4px 20px rgba(0,0,0,.08)', transition:'border-color .2s' }}
            onFocusCapture={e => e.currentTarget.style.borderColor='rgba(124,58,237,.5)'}
            onBlurCapture={e => e.currentTarget.style.borderColor='rgba(124,58,237,.25)'}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about travel…" rows={1}
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:14, fontFamily:'Plus Jakarta Sans,sans-serif', resize:'none', lineHeight:1.55, maxHeight:100, overflowY:'auto' }}
              onInput={e => { e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
            />
            <button onClick={() => send()} disabled={!input.trim()||loading} style={{ width:40, height:40, borderRadius:10, background:input.trim()&&!loading?'linear-gradient(135deg,#7c3aed,#6d28d9)':'rgba(124,58,237,.15)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()&&!loading?'pointer':'not-allowed', flexShrink:0, transition:'all .2s', boxShadow:input.trim()&&!loading?'0 4px 15px rgba(124,58,237,.4)':'none' }}>
              {loading ? <Spinner size={15} color="#a78bfa"/> : <Send size={15} color={input.trim()?'#fff':'#6b7280'}/>}
            </button>
          </div>
          <div style={{ fontSize:10, color:'var(--muted)', textAlign:'center', marginTop:7 }}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}