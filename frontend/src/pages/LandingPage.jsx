import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Static data ────────────────────────────────────────────────────────────
const DESTINATIONS = [
  { name:'Masai Mara',  country:'Kenya',       price:'240,000', code:'KE', color:'#c9784c' },
  { name:'Zanzibar',    country:'Tanzania',    price:'156,000', code:'TZ', color:'#4c9bc9' },
  { name:'Paris',       country:'France',      price:'312,000', code:'FR', color:'#9b6fd4' },
  { name:'Bali',        country:'Indonesia',   price:'195,000', code:'ID', color:'#4cba7e' },
  { name:'Dubai',       country:'UAE',         price:'390,000', code:'AE', color:'#c9a84c' },
  { name:'Maldives',    country:'Maldives',    price:'520,000', code:'MV', color:'#4ab8d4' },
  { name:'Santorini',   country:'Greece',      price:'280,000', code:'GR', color:'#d47b9b' },
  { name:'Tokyo',       country:'Japan',       price:'260,000', code:'JP', color:'#e05555' },
  { name:'New York',    country:'USA',         price:'350,000', code:'US', color:'#7b9bd4' },
  { name:'Cape Town',   country:'S. Africa',   price:'182,000', code:'ZA', color:'#4cba9b' },
  { name:'Iceland',     country:'Iceland',     price:'450,000', code:'IS', color:'#6b9fd4' },
  { name:'Barcelona',   country:'Spain',       price:'234,000', code:'ES', color:'#d49b4c' },
  { name:'Sydney',      country:'Australia',   price:'320,000', code:'AU', color:'#d4a44c' },
  { name:'Machu Picchu',country:'Peru',        price:'298,000', code:'PE', color:'#9bd44c' },
  { name:'Amboseli',    country:'Kenya',       price:'188,500', code:'KE', color:'#c9784c' },
];

const FEATURES = [
  { icon:'→',  title:'15 Global Destinations',  desc:'Kenyan safaris to European cities, Asian temples and tropical islands' },
  { icon:'💰', title:'All Priced in KES',        desc:'Transparent Kenya Shilling pricing — no hidden forex surprises' },
  { icon:'AI', title:'AI Travel Assistant',      desc:'24/7 intelligent chatbot to plan your perfect itinerary' },
  { icon:'📱', title:'Mobile First',             desc:'Book your dream trip from any device, anywhere, anytime' },
  { icon:'★',  title:'Curated Hotels',           desc:'Hand-picked accommodations from budget-friendly to ultra-luxury' },
  { icon:'◎',  title:'Activities Included',      desc:'Book local experiences and adventures alongside your accommodation' },
];

// ─── 8 phases × ~22s each ≈ 3 minutes ──────────────────────────────────────
const PHASES = [
  {
    icon: 'WT', accent: '#c9a84c',
    bg: ['#fff7e6','#ede9fe','#e0f2fe'],
    title: 'Welcome to WorldTrips',
    sub: 'Your Gateway to the World',
    desc: 'A complete travel booking experience built for Kenyan travellers.',
    voice: `Welcome to WorldTrips — Kenya's most exciting travel platform.
      Whether you dream of watching the Great Wildebeest Migration in the Masai Mara,
      sipping coffee at a Parisian café, or floating above the crystal-blue waters of the Maldives —
      WorldTrips makes it possible. We have built a complete travel experience designed specifically
      for Kenyan travellers, with everything priced in Kenya Shillings so there are no surprises.
      Your adventure of a lifetime begins right here.`,
  },
  {
    icon: '15', accent: '#4cba7e',
    bg: ['#dcfce7','#e0f2fe','#fef9c3'],
    title: 'Explore 15 Destinations',
    sub: 'Across 7 Regions Worldwide',
    desc: 'From the Masai Mara to the Northern Lights — the world is yours.',
    voice: `WorldTrips gives you access to fifteen incredible destinations spread across
      Africa, Europe, Asia, Oceania and the Americas. Explore the Big Five on a Masai Mara safari
      starting at just two hundred and forty thousand shillings. Relax on the pristine white beaches
      of Zanzibar. Marvel at the Eiffel Tower in Paris. Ride through the rice terraces of Bali.
      Watch the Northern Lights shimmer over Iceland. Discover ancient Inca ruins at Machu Picchu in Peru.
      Every destination is carefully curated to give you the best possible experience for your budget.`,
  },
  {
    icon: '★', accent: '#4ab8d4',
    bg: ['#e0f2fe','#ede9fe','#fdf2f8'],
    title: 'Book Everything in One Place',
    sub: 'Hotels · Activities · Experiences',
    desc: 'One platform. Your entire trip taken care of.',
    voice: `Forget juggling between ten different apps and websites. WorldTrips lets you plan and
      book your entire trip in one beautiful platform. Browse curated hotel options for every budget —
      from intimate boutique guesthouses to five-star luxury resorts. Add handpicked local activities
      to your itinerary — game drives, cooking classes, scuba diving, city tours and much more.
      Everything is bundled together cleanly, so you can see your complete trip at a glance
      and book it all with just a few clicks. Travel planning has never been this simple.`,
  },
  {
    icon: '💰', accent: '#e8c97a',
    bg: ['#fffbeb','#fef3c7','#ffedd5'],
    title: 'All Priced in KES',
    sub: 'No Hidden Fees. No Surprises.',
    desc: 'What you see is exactly what you pay.',
    voice: `One of the biggest frustrations for Kenyan travellers is hidden fees and currency confusion.
      At WorldTrips, every single price — from hotel rooms to safari game drives to international flights —
      is displayed in Kenya Shillings. There are no surprise dollar conversions at checkout.
      No mystery service charges added at the last minute. No exchange rate shocks.
      What you see on your screen is exactly what comes out of your M-Pesa or bank account.
      We believe travel should be exciting, not stressful. Transparent pricing is our commitment to you.`,
  },
  {
    icon: '📱', accent: '#9b6fd4',
    bg: ['#f3e8ff','#fce7f3','#e0f2fe'],
    title: 'Pay Your Way',
    sub: 'M-Pesa · Visa · Mastercard',
    desc: 'Secure, instant payment with the methods you trust.',
    voice: `Paying for your dream trip has never been easier. WorldTrips accepts M-Pesa — Kenya's
      most trusted payment method — so you can book your Paris holiday or Zanzibar beach escape
      directly from your phone in seconds. We also accept Visa and Mastercard for those who prefer
      card payments. All transactions are fully encrypted and secure. Once payment is confirmed,
      you receive an instant booking confirmation with all your trip details.
      No waiting. No paperwork. Just pure excitement as you prepare for your next adventure.`,
  },
  {
    icon: 'AI', accent: '#06b6d4',
    bg: ['#e0f2fe','#e9d5ff','#fefce8'],
    title: 'AI Travel Assistant',
    sub: 'Ask Anything. Plan Everything.',
    desc: 'Your personal travel expert available 24 hours a day.',
    voice: `Imagine having a personal travel expert available to answer your questions at any hour —
      day or night. That is exactly what the WorldTrips AI Travel Assistant offers you.
      Ask about visa requirements for Kenyan passport holders travelling to Japan. 
      Request a seven-day itinerary for Bali on a budget of one hundred and fifty thousand shillings.
      Compare the best time to visit Santorini versus the Maldives.
      Get packing tips, flight advice, local customs and safety information for any destination.
      Our AI assistant knows all fifteen destinations inside and out, and it speaks your language.`,
  },
  {
    icon: '◆', accent: '#f59e0b',
    bg: ['#fff7ed','#fee2e2','#fefce8'],
    title: 'Why Kenyan Travellers Choose Us',
    sub: 'Built Here. For You.',
    desc: 'A platform that understands what Kenyan travellers actually need.',
    voice: `WorldTrips was built by Kenyans, for Kenyans. We understand that you want to see the world
      on your terms — with pricing you can trust, payments you already use, and support that understands
      your travel needs. Our platform is fully mobile-optimised so you can browse, compare and book
      from your smartphone whether you are on a matatu or sitting at home.
      We offer customer support in English and Swahili. We understand Kenyan public holidays
      and peak travel seasons. We know that value for money matters deeply to you.
      That is why everything we build puts the Kenyan traveller first.`,
  },
  {
    icon: '→', accent: '#c9a84c',
    bg: ['#07031a','#120640','#0b1240'],
    title: 'Your Journey Starts Now',
    sub: 'Sign Up Free · Start Exploring',
    desc: 'Thousands of Kenyan travellers have already begun their adventures.',
    voice: `The world is waiting for you. Fifteen incredible destinations. Transparent pricing in Kenya Shillings.
      Seamless M-Pesa and card payments. A powerful AI travel assistant available around the clock.
      And a platform built specifically for the way you travel.
      Creating your WorldTrips account is completely free and takes less than two minutes.
      Once you sign up, you can browse all fifteen destinations, save your favourites,
      get personalised recommendations from our AI assistant, and book your first trip.
      Your next great adventure — whether it is a Masai Mara sunrise game drive
      or a sunset dinner overlooking the Santorini caldera — starts with a single click.
      Welcome to WorldTrips. The world is yours.`,
  },
];

// ─── Web Speech helper ───────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  // Clean the text (collapse whitespace/newlines)
  const clean = text.replace(/\s+/g, ' ').trim();
  const utt   = new SpeechSynthesisUtterance(clean);
  utt.rate    = 0.87;
  utt.pitch   = 1.02;
  utt.volume  = 1;

  // Best English voice
  const voices = window.speechSynthesis.getVoices();
  const voice  =
    voices.find(v => v.lang === 'en-GB' && v.name.includes('Google')) ||
    voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
    voices.find(v => v.lang.startsWith('en') && /Samantha|Karen|Daniel|Victoria|Female/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en'));
  if (voice) utt.voice = voice;

  // Chrome kills speech after ~15s — keepalive ping every 10s
  const keepAlive = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 10000);

  utt.onend   = () => { clearInterval(keepAlive); onEnd?.(); };
  utt.onerror = (e) => { clearInterval(keepAlive); if (e.error !== 'interrupted') onEnd?.(); };

  window.speechSynthesis.speak(utt);
}

// ─── Animated sound wave ─────────────────────────────────────────────────────
function SoundWave({ active, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, height:28 }}>
      <style>{`@keyframes wv{0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1.5)}}`}</style>
      {[...Array(14)].map((_,i) => (
        <div key={i} style={{
          width:3, borderRadius:2, height:20,
          background: active ? color : 'rgba(255,255,255,0.1)',
          transform: active ? undefined : 'scaleY(0.3)',
          animation: active ? `wv ${0.7+i%4*0.15}s ease-in-out infinite` : 'none',
          animationDelay: active ? (i*0.07)+'s' : '0s',
          transition: 'background 0.4s ease',
        }}/>
      ))}
    </div>
  );
}

// ─── Intro Video ─────────────────────────────────────────────────────────────
function IntroVideo({ onFinish }) {
  const [step, setStep]     = useState('splash'); // 'splash' | 'playing'
  const [phase, setPhase]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [talking, setTalking]   = useState(false);

  const dead    = useRef(false);
  const progRef = useRef(null);
  const timer   = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => {
    dead.current = true;
    clearInterval(progRef.current);
    clearTimeout(timer.current);
    window.speechSynthesis?.cancel();
  }, []);

  function startProgressBar(idx) {
    clearInterval(progRef.current);
    const base = (idx / PHASES.length) * 100;
    const seg  = 100 / PHASES.length;
    let t = 0;
    progRef.current = setInterval(() => {
      t += 100;
      setProgress(base + seg * Math.min(t / 22000, 0.95));
    }, 100);
  }

  function playPhase(idx) {
    if (dead.current) return;
    setPhase(idx);
    setTalking(true);
    startProgressBar(idx);

    speak(PHASES[idx].voice, () => {
      if (dead.current) return;
      clearInterval(progRef.current);
      setProgress(((idx + 1) / PHASES.length) * 100);
      setTalking(false);

      const next = idx + 1;
      if (next >= PHASES.length) {
        dead.current = true;
        timer.current = setTimeout(() => {
          window.speechSynthesis?.cancel();
          onFinish();
        }, 900);
      } else {
        timer.current = setTimeout(() => playPhase(next), 800);
      }
    });
  }

  // ── SPLASH ──────────────────────────────────────────────────
  if (step === 'splash') {
    return (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'linear-gradient(160deg,#ffffff,#ede9fe,#e0f2fe)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        fontFamily:"'Outfit',sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Outfit:wght@400;600;700&display=swap');
          @keyframes sp-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
          @keyframes sp-in     { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
          @keyframes sp-glow   { 0%,100%{box-shadow:0 0 36px #c9a84c55,0 4px 20px #0009} 50%{box-shadow:0 0 72px #c9a84ccc,0 4px 20px #0009} }
        `}</style>

        {/* Glow orbs */}
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'18%',left:'12%',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,60,220,.18) 0%,transparent 70%)',filter:'blur(50px)'}}/>
          <div style={{position:'absolute',bottom:'18%',right:'12%',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.13) 0%,transparent 70%)',filter:'blur(55px)'}}/>
          {[...Array(18)].map((_,i)=>(
            <div key={i} style={{position:'absolute',borderRadius:'50%',width:(2+i%3)+'px',height:(2+i%3)+'px',background:`rgba(201,168,76,${.15+i%3*.1})`,left:(i*5.6)%100+'%',top:(i*6.9)%100+'%',animation:`sp-float ${3+i%4}s ease-in-out infinite`,animationDelay:(i*.22)+'s'}}/>
          ))}
        </div>

        {/* Logo */}
        <div style={{animation:'sp-in .65s ease both',textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:48,fontWeight:900,color:'#c9a84c',fontFamily:"'Outfit',sans-serif",marginBottom:14,display:'inline-block',animation:'sp-float 2.8s ease-in-out infinite',filter:'drop-shadow(0 0 24px #c9a84c88)',letterSpacing:2}}>WT</div>
          <div style={{fontSize:38,fontWeight:700,color:'#111827',fontFamily:"'Playfair Display',serif",lineHeight:1}}>
            World<span style={{background:'linear-gradient(135deg,#c9a84c,#ecd980)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Trips</span>
          </div>
          <div style={{fontSize:10,color:'rgba(201,168,76,.5)',letterSpacing:5,marginTop:8}}>TRAVEL AGENCY</div>
        </div>

        {/* Tagline */}
        <p style={{animation:'sp-in .65s .15s ease both',fontSize:15,color:'rgba(15,23,42,.55)',lineHeight:1.8,maxWidth:360,textAlign:'center',margin:'0 0 14px',padding:'0 28px'}}>
          A cinematic 3-minute guide to 15 amazing destinations
        </p>
        <p style={{animation:'sp-in .65s .22s ease both',fontSize:13,color:'rgba(109,40,217,.45)',textAlign:'center',margin:'0 0 44px'}}>
          🔊 &nbsp;Turn your volume up for narration
        </p>

        {/* BIG START BUTTON — speak() called HERE synchronously = user gesture */}
        <button
          onClick={() => {
            // Reset dead flag (React Strict Mode fires cleanup early)
            dead.current = false;
            setStep('playing');
            setPhase(0);
            setTalking(true);
            startProgressBar(0);
            // ★ speak called DIRECTLY in onClick — browser allows it ★
            speak(PHASES[0].voice, () => {
              if (dead.current) return;
              clearInterval(progRef.current);
              setProgress(100 / PHASES.length);
              setTalking(false);
              timer.current = setTimeout(() => playPhase(1), 800);
            });
          }}
          style={{
            animation:'sp-in .65s .3s ease both, sp-glow 2.2s 1s ease-in-out infinite',
            padding:'18px 60px', borderRadius:50,
            background:'linear-gradient(135deg,#c9a84c,#ecd980)',
            border:'none', color:'#07101e',
            fontSize:18, fontWeight:700, fontFamily:"'Outfit',sans-serif",
            cursor:'pointer', letterSpacing:.5, marginBottom:18,
          }}
        >
          ▶ &nbsp; Begin Experience
        </button>

        <button onClick={onFinish} style={{animation:'sp-in .65s .42s ease both',background:'none',border:'none',color:'rgba(15,23,42,.28)',fontSize:13,cursor:'pointer',fontFamily:"'Outfit',sans-serif",letterSpacing:.4}}>
          Skip intro →
        </button>
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────────
  const cur = PHASES[phase];
  const isDarkPhase = phase === PHASES.length - 1;
  const bg  = `radial-gradient(ellipse at 30% 30%,${cur.accent}20 0%,transparent 55%),
    radial-gradient(ellipse at 75% 75%,${cur.accent}0e 0%,transparent 50%),
    linear-gradient(160deg,${cur.bg[0]} 0%,${cur.bg[1]} 50%,${cur.bg[2]} 100%)`;

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',sans-serif",overflow:'hidden',transition:'background 2s ease'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes pt-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pt-pop   { 0%{transform:scale(.35) rotate(-8deg);opacity:0} 65%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes pt-in    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pt-ring  { 0%,100%{transform:scale(1);opacity:.18} 50%{transform:scale(1.1);opacity:.4} }
        @keyframes pt-scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .pt-in  { animation: pt-in .55s cubic-bezier(.22,1,.36,1) both; }
        .pt-pop { animation: pt-pop .65s cubic-bezier(.22,1,.36,1) forwards; }
      `}</style>

      {/* Grid + scanline overlay */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${cur.accent}09 1px,transparent 1px),linear-gradient(90deg,${cur.accent}09 1px,transparent 1px)`,backgroundSize:'52px 52px'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${cur.accent}70,transparent)`,animation:'pt-scan 7s linear infinite',opacity:.45}}/>
      </div>

      {/* Particles + glow orbs */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {[...Array(20)].map((_,i)=>(
          <div key={i} style={{position:'absolute',width:(i%3===0?5:i%3===1?3:2)+'px',height:(i%3===0?5:i%3===1?3:2)+'px',borderRadius:'50%',background:i%4===0?cur.accent:`rgba(255,255,255,${.07+(i%5)*.04})`,left:(i*5.1)%100+'%',top:(i*7.3)%100+'%',animation:`pt-float ${3.5+i%5}s ease-in-out infinite`,animationDelay:(i*.24)+'s'}}/>
        ))}
        <div style={{position:'absolute',top:'14%',left:'8%',width:380,height:380,borderRadius:'50%',background:`radial-gradient(circle,${cur.accent}1a 0%,transparent 70%)`,filter:'blur(55px)',transition:'background 2s ease'}}/>
        <div style={{position:'absolute',bottom:'14%',right:'8%',width:460,height:460,borderRadius:'50%',background:`radial-gradient(circle,${cur.accent}0e 0%,transparent 70%)`,filter:'blur(65px)',transition:'background 2s ease'}}/>
      </div>

      {/* Logo top */}
      <div style={{position:'absolute',top:26,left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:11,zIndex:10}}>
        <div style={{width:42,height:42,borderRadius:11,background:'linear-gradient(135deg,#c9a84c,#9d7c2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#07101e',fontFamily:"'Outfit',sans-serif",letterSpacing:1,boxShadow:`0 0 22px ${cur.accent}70,0 4px 12px rgba(0,0,0,.5)`,transition:'box-shadow .8s ease'}}>WT</div>
        <div>
          <div style={{fontSize:19,fontWeight:700,color:isDarkPhase?'#f8fafc':'#111827',fontFamily:"'Playfair Display',serif",letterSpacing:-.4}}>World<span style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Trips</span></div>
          <div style={{fontSize:8,color:isDarkPhase?'rgba(248,250,252,.65)':'rgba(55,65,81,.75)',letterSpacing:3}}>TRAVEL AGENCY</div>
        </div>
      </div>

      {/* Phase dots */}
      <div style={{position:'absolute',top:86,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6,zIndex:10}}>
        {PHASES.map((_,i)=>(
          <div key={i} style={{height:4,borderRadius:2,transition:'all .5s ease',width:i===phase?28:7,background:i<phase?cur.accent:i===phase?`linear-gradient(90deg,${cur.accent},#e8c97a)`:'rgba(255,255,255,.1)',boxShadow:i===phase?`0 0 8px ${cur.accent}`:'none'}}/>
        ))}
      </div>

      {/* Central content */}
      <div style={{position:'relative',zIndex:2,textAlign:'center',padding:'0 24px',maxWidth:700,marginTop:40}}>
        {/* Icon with rings */}
        <div style={{position:'relative',display:'inline-block',marginBottom:24}}>
          <div style={{position:'absolute',inset:-26,borderRadius:'50%',border:`1px solid ${cur.accent}38`,animation:'pt-ring 3s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:-46,borderRadius:'50%',border:`1px solid ${cur.accent}18`,animation:'pt-ring 3s ease-in-out infinite',animationDelay:'.6s'}}/>
          <div key={'icon-'+phase} className="pt-pop" style={{
            fontSize: cur.icon.length > 2 ? 56 : 82,
            fontWeight: cur.icon.length > 1 ? 800 : 400,
            fontFamily: cur.icon.length > 1 ? "'Outfit',sans-serif" : 'inherit',
            filter:`drop-shadow(0 0 26px ${cur.accent}a0)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            width:100, height:100,
            color: cur.accent,
            letterSpacing: cur.icon === 'AI' ? 2 : 0,
            lineHeight:1,
          }}>
            {cur.icon}
          </div>
        </div>

        {/* Counter */}
        <div style={{fontSize:9,letterSpacing:5,color:`${cur.accent}cc`,marginBottom:16,textTransform:'uppercase',fontWeight:600}}>
          {phase+1} of {PHASES.length}
        </div>

        {/* Title */}
        <h1 key={'t-'+phase} className="pt-in" style={{fontSize:'clamp(26px,5.5vw,56px)',fontWeight:700,color:isDarkPhase?'#f8fafc':'#111827',fontFamily:"'Playfair Display',serif",lineHeight:1.1,marginBottom:12,textShadow:isDarkPhase?`0 0 70px ${cur.accent}55`:'none'}}>
          {cur.title}
        </h1>

        {/* Subtitle */}
        <div key={'s-'+phase} className="pt-in" style={{fontSize:'clamp(13px,2.4vw,20px)',fontWeight:500,marginBottom:16,background:`linear-gradient(135deg,${cur.accent},#e8c97a)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animationDelay:'.1s'}}>
          {cur.sub}
        </div>

        {/* Description */}
        <p key={'d-'+phase} className="pt-in" style={{fontSize:'clamp(12px,1.8vw,15.5px)',color:isDarkPhase?'rgba(248,250,252,.78)':'#6b7280',lineHeight:1.85,maxWidth:500,margin:'0 auto 22px',animationDelay:'.2s'}}>
          {cur.desc}
        </p>

        {/* Sound wave */}
        <div style={{marginBottom:8}}>
          <SoundWave active={talking} color={cur.accent}/>
          <div style={{fontSize:9,color:'rgba(255,255,255,.18)',letterSpacing:3,marginTop:5,textTransform:'uppercase'}}>
            {talking ? 'Narrating' : ''}
          </div>
        </div>

        {/* Phase 1 — destination chips */}
        {phase === 1 && (
          <div key="chips" className="pt-in" style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',animationDelay:'.3s'}}>
            {DESTINATIONS.slice(0,10).map(d=>(
              <div key={d.name} style={{padding:'4px 12px',borderRadius:20,background:'rgba(255,255,255,.75)',border:`1px solid ${cur.accent}35`,fontSize:11.5,color:'#374151',display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:9,fontWeight:700,color:cur.accent,letterSpacing:1}}>{d.code}</span> {d.name}
              </div>
            ))}
          </div>
        )}
        {/* Phase 2 — booking badges */}
        {phase === 2 && (
          <div key="badges" className="pt-in" style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',animationDelay:'.3s'}}>
            {['Hotels','Activities','Itineraries','Secure Booking'].map(f=>(
              <div key={f} style={{padding:'8px 16px',borderRadius:9,background:`rgba(201,168,76,.08)`,border:`1px solid ${cur.accent}40`,fontSize:12.5,color:'#e8c97a',fontWeight:500}}>{f}</div>
            ))}
          </div>
        )}
        {/* Phase 4 — payment methods */}
        {phase === 4 && (
          <div key="payments" className="pt-in" style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',animationDelay:'.3s'}}>
            {['📱 M-Pesa','💳 Visa','💳 Mastercard','Secure'].map(f=>(
              <div key={f} style={{padding:'8px 16px',borderRadius:9,background:`rgba(155,111,212,.1)`,border:`1px solid ${cur.accent}40`,fontSize:12.5,color:'#c4a5f5',fontWeight:500}}>{f}</div>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{position:'absolute',bottom:0,left:0,right:0}}>
        <div style={{height:3,background:'rgba(255,255,255,.04)'}}>
          <div style={{height:'100%',width:progress+'%',background:`linear-gradient(90deg,${cur.accent},#e8c97a)`,transition:'width .12s linear',boxShadow:`0 0 10px ${cur.accent}`}}/>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={() => { dead.current=true; clearInterval(progRef.current); clearTimeout(timer.current); window.speechSynthesis?.cancel(); onFinish(); }}
        style={{position:'absolute',bottom:20,right:26,background:isDarkPhase?'rgba(255,255,255,.08)':'#ffffff',border:isDarkPhase?'1px solid rgba(255,255,255,.2)':'1px solid #e5e7eb',color:isDarkPhase?'rgba(248,250,252,.85)':'#374151',padding:'7px 18px',borderRadius:20,fontSize:12,cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all .2s',backdropFilter:'blur(8px)',boxShadow:isDarkPhase?'none':'0 1px 3px rgba(0,0,0,.08)'}}
        onMouseEnter={e=>{e.currentTarget.style.background=isDarkPhase?'rgba(255,255,255,.16)':'#f9fafb';e.currentTarget.style.color=isDarkPhase?'#f8fafc':'#111827';}}
        onMouseLeave={e=>{e.currentTarget.style.background=isDarkPhase?'rgba(255,255,255,.08)':'#ffffff';e.currentTarget.style.color=isDarkPhase?'rgba(248,250,252,.85)':'#374151';}}
      >
        Skip intro →
      </button>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const nav = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {
    if (!showIntro) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [showIntro]);

  if (showIntro) {
    return <IntroVideo onFinish={() => setShowIntro(false)} />;
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      color:'var(--text)', fontFamily:"'Outfit',sans-serif",
      opacity: visible ? 1 : 0, transition:'opacity .7s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes hero-float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
        .cta-btn:hover   { transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,168,76,.4)!important; }
        .dest-card:hover { transform:translateY(-4px); border-color:rgba(201,168,76,.4)!important; background:#ffffff!important; box-shadow:0 8px 24px rgba(0,0,0,.1)!important; }
        .feature-card:hover { border-color:rgba(201,168,76,.35)!important; background:#fafafa!important; box-shadow:0 4px 12px rgba(0,0,0,.06)!important; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'80px 24px 60px',position:'relative',overflow:'hidden'}}>
        {/* Background */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#fff7e6 0%,#ede9fe 50%,#e0f2fe 100%)'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>
          <div style={{position:'absolute',top:'20%',right:'5%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,60,220,.14) 0%,transparent 70%)',filter:'blur(60px)'}}/>
          <div style={{position:'absolute',bottom:'10%',left:'5%',width:440,height:440,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.1) 0%,transparent 70%)',filter:'blur(55px)'}}/>
        </div>

        <div style={{maxWidth:1200,margin:'0 auto',width:'100%',position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
          {/* Left */}
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 16px',borderRadius:20,background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.22)',fontSize:12,color:'rgba(201,168,76,.9)',marginBottom:26,letterSpacing:.5}}>
              ✦ &nbsp; Kenya's #1 Travel Platform
            </div>
            <h1 style={{fontSize:'clamp(36px,5vw,70px)',fontFamily:"'Playfair Display',serif",fontWeight:700,lineHeight:1.08,marginBottom:22,color:'#111827'}}>
              Discover the<br/>
              <span style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a,#c9a84c)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 3.5s linear infinite'}}>World's Best</span><br/>
              Destinations
            </h1>
            <p style={{fontSize:16,color:'#6b7280',lineHeight:1.85,marginBottom:36,maxWidth:460}}>
              Book your dream trip across 15 hand-picked global destinations. All prices in Kenya Shillings. Hotels, activities and AI travel planning in one place.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:48}}>
              <button onClick={()=>nav('/signup')} className="cta-btn" style={{padding:'14px 34px',borderRadius:10,background:'linear-gradient(135deg,#c9a84c,#e8c97a)',border:'none',color:'#07101e',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all .3s',display:'flex',alignItems:'center',gap:8}}>
                Start Exploring →
              </button>
              <button onClick={()=>nav('/login')} style={{padding:'14px 28px',borderRadius:10,background:'#ffffff',border:'1px solid #e5e7eb',color:'#374151',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all .2s',boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
                Sign In →
              </button>
            </div>
            <div style={{display:'flex',gap:32,flexWrap:'wrap'}}>
              {[['15','Destinations'],['KES','Pricing'],['24/7','AI Support'],['2','Click Booking']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontSize:26,fontWeight:700,color:'#c9a84c',fontFamily:"'Playfair Display',serif"}}>{n}</div>
                  <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — destination cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxHeight:480,overflow:'hidden'}}>
            {DESTINATIONS.slice(0,6).map((d,i)=>(
              <div key={d.name} style={{
                borderRadius:14, border:'1px solid #e5e7eb',
                background:'#ffffff', backdropFilter:'blur(12px)',
                padding:20, cursor:'pointer', transition:'all .3s',
                animation:`hero-float ${4+i*.4}s ease-in-out infinite`,
                animationDelay:(i*.5)+'s',
                boxShadow:'0 1px 3px rgba(0,0,0,.08)',
              }} onClick={()=>nav('/signup')}>
                <div style={{width:44,height:44,borderRadius:10,background:`${d.color}22`,border:`1px solid ${d.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:d.color,letterSpacing:1,marginBottom:10}}>{d.code}</div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:3,color:'#111827'}}>{d.name}</div>
                <div style={{fontSize:11,color:'#6b7280',marginBottom:10}}>{d.country}</div>
                <div style={{fontSize:12,color:d.color,fontWeight:600}}>KES {d.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Destinations Marquee ─────────────────────────────── */}
      <div style={{padding:'18px 0',background:'rgba(201,168,76,.04)',borderTop:'1px solid rgba(201,168,76,.08)',borderBottom:'1px solid rgba(201,168,76,.08)',overflow:'hidden'}}>
        <div style={{display:'flex',gap:28,animation:'marquee 22s linear infinite',whiteSpace:'nowrap'}}>
          {[...DESTINATIONS,...DESTINATIONS].map((d,i)=>(
            <span key={i} style={{fontSize:13,color:'rgba(201,168,76,.55)',display:'inline-flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:9,fontWeight:800,color:'#c9a84c',letterSpacing:.5}}>{d.code}</span> {d.name} <span style={{color:'rgba(201,168,76,.18)'}}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'100px 24px'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:10,letterSpacing:4,color:'rgba(201,168,76,.6)',marginBottom:14,textTransform:'uppercase'}}>Everything you need</div>
            <h2 style={{fontSize:'clamp(26px,4vw,46px)',fontFamily:"'Playfair Display',serif",fontWeight:500,marginBottom:14,color:'#111827'}}>
            Built for <span style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Kenyan Travellers</span>
          </h2>
          <p style={{color:'#6b7280',fontSize:15,maxWidth:480,margin:'0 auto'}}>A complete travel booking platform designed with your needs in mind</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:18}}>
          {FEATURES.map((f,i)=>(
            <div key={f.title} className="feature-card" style={{padding:26,borderRadius:14,background:'#ffffff',border:'1px solid #e5e7eb',transition:'all .3s',cursor:'default',boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
              <div style={{fontSize: f.icon.length > 1 ? 20 : 30, fontWeight:800, color:'#c9a84c', fontFamily:"'Outfit',sans-serif", letterSpacing: f.icon === 'AI' ? 2 : 0, marginBottom:14, lineHeight:1}}>{f.icon}</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:8,color:'#111827'}}>{f.title}</div>
              <div style={{fontSize:13,color:'#6b7280',lineHeight:1.7}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Destinations Grid ────────────────────────────────── */}
      <div style={{background:'#f3f4f6',padding:'80px 0',borderTop:'1px solid #e5e7eb',borderBottom:'1px solid #e5e7eb'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:46}}>
            <div style={{fontSize:10,letterSpacing:4,color:'rgba(201,168,76,.6)',marginBottom:12,textTransform:'uppercase'}}>EXPLORE</div>
            <h2 style={{fontSize:'clamp(24px,4vw,42px)',fontFamily:"'Playfair Display',serif",fontWeight:500,color:'#111827'}}>
              15 Amazing <span style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Destinations</span>
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:13}}>
            {DESTINATIONS.map(d=>(
              <div key={d.name} className="dest-card" onClick={()=>nav('/signup')} style={{padding:'18px 16px',borderRadius:12,cursor:'pointer',background:'#ffffff',border:'1px solid #e5e7eb',transition:'all .3s',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
                <div style={{width:38,height:38,borderRadius:8,background:`${d.color}18`,border:`1px solid ${d.color}38`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:d.color,letterSpacing:.8,marginBottom:9}}>{d.code}</div>
                <div style={{fontWeight:600,fontSize:13.5,marginBottom:3,color:'#111827'}}>{d.name}</div>
                <div style={{fontSize:10.5,color:'#6b7280',marginBottom:9}}>{d.country}</div>
                <div style={{fontSize:12,color:'#c9a84c',fontWeight:600}}>From KES {d.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'100px 24px',textAlign:'center'}}>
        <div style={{position:'relative',padding:'80px 40px',borderRadius:24,background:'linear-gradient(135deg,rgba(138,79,212,.12),rgba(201,168,76,.08),rgba(74,144,217,.1))',border:'1px solid rgba(201,168,76,.15)',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)',backgroundSize:'30px 30px'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:13,letterSpacing:4,color:'rgba(201,168,76,.5)',textTransform:'uppercase',fontWeight:600,marginBottom:20}}>WorldTrips</div>
            <h2 style={{fontSize:'clamp(26px,4vw,50px)',fontFamily:"'Playfair Display',serif",fontWeight:600,marginBottom:14,color:'#111827'}}>
              Ready to Explore the World?
            </h2>
            <p style={{fontSize:16,color:'#6b7280',marginBottom:36,maxWidth:460,margin:'0 auto 36px'}}>
              Join thousands of Kenyan travellers who have discovered the world with WorldTrips. Sign up free today.
            </p>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>nav('/signup')} className="cta-btn" style={{padding:'15px 42px',borderRadius:10,background:'linear-gradient(135deg,#c9a84c,#e8c97a)',border:'none',color:'#07101e',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all .3s'}}>
                Create Free Account →
              </button>
              <button onClick={()=>nav('/login')} style={{padding:'15px 32px',borderRadius:10,background:'#ffffff',border:'1px solid #e5e7eb',color:'#374151',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all .2s',boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
                I have an account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{borderTop:'1px solid rgba(201,168,76,.08)',padding:'30px 24px',textAlign:'center'}}>
        <div style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:8}}>
          World<span style={{background:'linear-gradient(135deg,#c9a84c,#e8c97a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Trips</span>
        </div>
        <div style={{fontSize:12,color:'#6b7280'}}>© 2026 WorldTrips Travel Agency · Nairobi, Kenya · All prices in KES</div>
      </div>
    </div>
  );
}