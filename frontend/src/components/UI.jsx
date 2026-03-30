import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import React from 'react';

export function Spinner({ size = 20, color = '#c9a84c' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid ${color}33`, borderTopColor: color,
      borderRadius: '50%', flexShrink: 0,
      animation: 'spin 0.9s linear infinite',
    }} />
  );
}

export function kes(n) {
  return 'KES ' + Math.round(n || 0).toLocaleString('en-KE');
}

export function StatusBadge({ status }) {
  const map = {
    pending:'badge badge-blue', confirmed:'badge badge-green',
    completed:'badge badge-purple', cancelled:'badge badge-red',
    rejected:'badge badge-red', paid:'badge badge-green',
    unpaid:'badge badge-yellow', refunded:'badge badge-blue',
    partial:'badge badge-yellow', customer:'badge badge-blue',
    admin:'badge badge-yellow', active:'badge badge-green',
    inactive:'badge badge-red',
  };
  return React.createElement('span', { className: map[status] || 'badge badge-blue' }, status);
}

const DEST_IMAGES = {
  'masai-mara':   'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&auto=format&fit=crop',
  'zanzibar':     'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80&auto=format&fit=crop',
  'paris':        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&auto=format&fit=crop',
  'bali':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
  'dubai':        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&auto=format&fit=crop',
  'maldives':     'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80&auto=format&fit=crop',
  'santorini':    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80&auto=format&fit=crop',
  'tokyo':        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&auto=format&fit=crop',
  'new-york':     'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80&auto=format&fit=crop',
  'cape-town':    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80&auto=format&fit=crop',
  'machu-picchu': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80&auto=format&fit=crop',
  'barcelona':    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80&auto=format&fit=crop',
  'iceland':      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80&auto=format&fit=crop',
  'sydney':       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
  'amboseli':     'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80&auto=format&fit=crop',
};

const HOTEL_IMAGES = {
  'mara serena safari lodge':  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80&auto=format&fit=crop',
  'governors camp':            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format&fit=crop',
  'ol seki hemingways':        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop',
  'zuri zanzibar hotel':       'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80&auto=format&fit=crop',
  'dhow palace hotel':         'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format&fit=crop',
  'hotel le marais':           'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&auto=format&fit=crop',
  'ibis paris centre':         'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80&auto=format&fit=crop',
  'ubud hanging gardens':      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800&q=80&auto=format&fit=crop',
  'kuta beach resort':         'https://images.unsplash.com/photo-1573548842355-73bb50e50b83?w=800&q=80&auto=format&fit=crop',
  'burj al arab':              'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?w=800&q=80&auto=format&fit=crop',
  'atlantis the palm':         'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80&auto=format&fit=crop',
  'conrad maldives rangali':   'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80&auto=format&fit=crop',
  'coco bodu hithi':           'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80&auto=format&fit=crop',
  'hotel arts barcelona':      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80&auto=format&fit=crop',
  'the retreat iceland':       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format&fit=crop',
};

export function DestImg({ dest, style = {} }) {
  const [err, setErr] = useState(false);
  const key = (dest.name || '').toLowerCase().replace(/\s+/g, '-');
  const src = DEST_IMAGES[key] || dest.image_path;
  if (err || !src) {
    return (
      <div style={{
        width:'100%', height:'100%',
        background: `linear-gradient(135deg,${dest.fallback_color||'#4a6fa5'}cc,${dest.fallback_color||'#4a6fa5'}44)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: 40, ...style
      }}>{dest.emoji || '🌍'}</div>
    );
  }
  return <img src={src} alt={dest.name} onError={() => setErr(true)}
    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', ...style }} />;
}

export function HotelImg({ name, style = {} }) {
  const [err, setErr] = useState(false);
  const key = (name || '').toLowerCase();
  const src = HOTEL_IMAGES[key];
  if (err || !src) {
    return (
      <div style={{
        width:'100%', height:'100%',
        background: 'linear-gradient(135deg,#1a3a5c,#0c1830)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: 32, ...style
      }}>🏨</div>
    );
  }
  return <img src={src} alt={name} onError={() => setErr(true)}
    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', ...style }} />;
}

let _add = null;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  _add = (msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  };
  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle size={15} />}
            {t.type === 'error'   && <AlertCircle size={15} />}
            {t.type === 'info'    && <Info size={15} />}
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', opacity:.6, display:'flex' }}>
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
export function toast(msg, type = 'info') { if (_add) _add(msg, type); }

export function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box fade-up" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid rgba(124,58,237,.12)' }}>
          <span className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{title}</span>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, onConfirm, title, message, danger = false }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
      <p style={{ color:'var(--muted2)', fontSize:14, lineHeight:1.65, marginBottom:22 }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-gold'} onClick={() => { onConfirm(); onClose(); }}>
          {danger ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'center', marginTop:20, padding:'0 12px 16px' }}>
      <button className="btn-outline" style={{ padding:'7px 14px', fontSize:13 }} disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
      <span style={{ fontSize:13, color:'var(--muted)', minWidth:90, textAlign:'center' }}>Page {page} / {pages}</span>
      <button className="btn-outline" style={{ padding:'7px 14px', fontSize:13 }} disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}

export function Empty({ icon = '📋', title = 'Nothing here', desc = '' }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
      <div style={{ fontSize:48, marginBottom:14 }}>{icon}</div>
      <h3 style={{ fontSize:18, color:'var(--muted2)', marginBottom:8 }}>{title}</h3>
      {desc && <p style={{ fontSize:13 }}>{desc}</p>}
    </div>
  );
}