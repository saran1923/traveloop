import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ICONS = { food:'🍜', sightseeing:'🏛️', adventure:'🧗', transport:'✈️', accommodation:'🏨', shopping:'🛍️', nature:'🌿', nightlife:'🎉', culture:'🎭', relaxation:'🧘', other:'📍' };

function groupByDate(stops) {
  const groups = {};
  stops.forEach(s => {
    const key = s.date || 'unscheduled';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return Object.entries(groups).sort(([a],[b]) => {
    if (a === 'unscheduled') return 1;
    if (b === 'unscheduled') return -1;
    return new Date(a) - new Date(b);
  });
}

export default function PublicTrip() {
  const { tripId } = useParams();
  const [trip,  setTrip]  = useState(null);
  const [stops, setStops] = useState([]);
  const [err,   setErr]   = useState('');

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data, error }) => {
      if (error || !data) { setErr('Trip not found.'); return; }
      if (!data.is_public) { setErr('This trip is private.'); return; }
      setTrip(data);
    });
    supabase.from('itinerary_stops').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => data && setStops(data));
  }, [tripId]);

  if (err) return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#444', fontFamily:'Outfit,sans-serif' }}>
      <p style={{ fontSize:48, marginBottom:16 }}>🔒</p>
      <p style={{ fontSize:18, color:'#555' }}>{err}</p>
      <Link to="/auth" style={{ marginTop:24, color:'var(--sig)', textDecoration:'none', fontSize:14, fontWeight:700 }}>Sign in to Traveloop →</Link>
    </div>
  );

  if (!trip) return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontFamily:'Outfit,sans-serif' }}>Loading…</div>
  );

  const days = groupByDate(stops);
  const duration = trip.start_date && trip.end_date ? Math.ceil((new Date(trip.end_date)-new Date(trip.start_date))/86400000)+1 : null;

  return (
    <div style={{ minHeight:'100vh', background:'#060606', fontFamily:'Outfit,sans-serif' }}>

      {/* Top bar */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid #0f0f0f', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'"Playfair Display",serif', fontSize:18, fontWeight:700, fontStyle:'italic', color:'var(--sig)' }}>Traveloop</div>
        <Link to="/auth" style={{ fontSize:12, color:'#555', textDecoration:'none', fontWeight:700 }}>Sign in →</Link>
      </div>

      {/* Hero */}
      <div style={{ position:'relative', height:320,
        background: trip.cover_url ? `url(${trip.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg,#111 0%,#1a0a00 100%)' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(6,6,6,1) 0%, rgba(6,6,6,0.3) 50%, transparent 100%)' }} />
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', textAlign:'center', width:'90%' }}>
          <span style={{ fontSize:48 }}>{trip.mood_emoji || '✈️'}</span>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(2rem,5vw,3.2rem)', color:'#fff', margin:'10px 0 6px', lineHeight:1.1 }}>{trip.name}</h1>
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {duration && <span style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{duration} days</span>}
            {stops.length > 0 && <span style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{stops.length} stops</span>}
            {trip.start_date && <span style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{new Date(trip.start_date).toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</span>}
          </div>
          {trip.ai_vibe_summary && <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', fontStyle:'italic', marginTop:8 }}>"{trip.ai_vibe_summary}"</p>}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth:700, margin:'0 auto', padding:'40px 20px 80px' }}>
        {trip.description && (
          <p style={{ fontSize:15, color:'#555', lineHeight:1.7, marginBottom:32, fontStyle:'italic', borderLeft:'2px solid var(--sig)', paddingLeft:16 }}>
            {trip.description}
          </p>
        )}

        {days.map(([date, dayStops], di) => (
          <div key={date} style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ background:'var(--sig)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#000', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {date === 'unscheduled' ? 'Unscheduled' : new Date(date+'T00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
              </div>
              <div style={{ flex:1, height:1, background:'#0f0f0f' }} />
            </div>
            <div style={{ paddingLeft:14, borderLeft:'2px solid #111', display:'flex', flexDirection:'column', gap:10 }}>
              {dayStops.map(s => (
                <div key={s.id} style={{ background:'#0a0a0a', border:'1px solid #141414', borderRadius:12, padding:'14px 16px', display:'flex', gap:12 }}>
                  <div style={{ fontSize:22, flexShrink:0 }}>{ICONS[s.category]||'📍'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#e5e5e5' }}>{s.title}</div>
                    {s.location && <div style={{ fontSize:12, color:'#444', marginTop:3 }}>📌 {s.location}</div>}
                    {s.notes && <div style={{ fontSize:12, color:'#3a3a3a', marginTop:6, lineHeight:1.5 }}>{s.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign:'center', marginTop:48, padding:'32px', background:'#0a0a0a', borderRadius:16, border:'1px solid #111' }}>
          <p style={{ fontFamily:'"Playfair Display",serif', fontSize:20, fontStyle:'italic', color:'#fff', marginBottom:8 }}>Plan your own adventure.</p>
          <p style={{ fontSize:13, color:'#444', marginBottom:20 }}>Traveloop — AI-powered travel planning made beautiful.</p>
          <Link to="/auth" style={{ display:'inline-block', background:'var(--sig)', color:'#000', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, padding:'12px 28px', borderRadius:10, textDecoration:'none' }}>
            Start for free →
          </Link>
        </div>
      </div>
    </div>
  );
}
