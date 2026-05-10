import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const ICONS = { food:'🍜', sightseeing:'🏛️', adventure:'🧗', transport:'✈️', accommodation:'🏨', shopping:'🛍️', nature:'🌿', nightlife:'🎉', culture:'🎭', relaxation:'🧘', other:'📍' };

function groupByDate(stops) {
  const groups = {};
  stops.forEach(s => {
    const key = s.date || 'unscheduled';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === 'unscheduled') return 1;
    if (b === 'unscheduled') return -1;
    return new Date(a) - new Date(b);
  });
}

export default function ItineraryView() {
  const { tripId } = useParams();
  const [trip,  setTrip]  = useState(null);
  const [stops, setStops] = useState([]);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => {
      if (data) { setTrip(data); setShareEnabled(data.is_public || false); }
    });
    supabase.from('itinerary_stops').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => data && setStops(data));
  }, [tripId]);

  useEffect(() => {
    if (shareEnabled) setShareLink(`${window.location.origin}/share/${tripId}`);
  }, [shareEnabled, tripId]);

  const toggleShare = async () => {
    setToggling(true);
    const next = !shareEnabled;
    await supabase.from('trips').update({ is_public: next }).eq('id', tripId);
    setShareEnabled(next);
    setToggling(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const days = groupByDate(stops);
  const duration = trip?.start_date && trip?.end_date
    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1
    : null;

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px 80px' }}>

      {/* Hero header */}
      <div style={{ borderRadius:16, overflow:'hidden', marginBottom:28, position:'relative', height:200,
        background: trip.cover_url ? `url(${trip.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, #111 0%, #1a0a00 100%)' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', bottom:20, left:24 }}>
          <span style={{ fontSize:36 }}>{trip.mood_emoji || '✈️'}</span>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.6rem,4vw,2.4rem)', color:'#fff', margin:'6px 0 4px', lineHeight:1.1 }}>{trip.name}</h1>
          {duration && <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{duration} days · {stops.length} stops</p>}
          {trip.ai_vibe_summary && <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontStyle:'italic', marginTop:4 }}>"{trip.ai_vibe_summary}"</p>}
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
        <Link to={`/trip/${tripId}/build`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>← Edit Itinerary</Link>
        <Link to={`/trip/${tripId}/budget`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>💰 Budget</Link>
        <Link to={`/trip/${tripId}/notes`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>📓 Notes</Link>

        {/* Share toggle */}
        <button onClick={toggleShare} disabled={toggling}
          style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s',
            background: shareEnabled ? 'var(--sig)' : '#111', color: shareEnabled ? '#000' : '#666', opacity: toggling ? 0.6 : 1 }}>
          {toggling ? '…' : shareEnabled ? '🔗 Public — Copy Link' : '🔒 Make Public'}
        </button>
      </div>

      {/* Share link banner */}
      <AnimatePresence>
        {shareEnabled && shareLink && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:12, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:12, color:'#888', flex:1, fontFamily:'monospace', wordBreak:'break-all' }}>{shareLink}</span>
            <button onClick={copy} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'7px 14px', background: copied?'#1a2a1a':'#111', color: copied?'#4caf50':'#888', border:`1px solid ${copied?'#4caf50':'#1e1e1e'}`, borderRadius:8, cursor:'pointer', whiteSpace:'nowrap' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {days.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#333' }}>
          <p style={{ fontSize:32 }}>🗺️</p>
          <p style={{ marginTop:8 }}>No stops yet — <Link to={`/trip/${tripId}/build`} style={{ color:'var(--sig)' }}>add them in the builder</Link>.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
          {days.map(([date, dayStops], dayIdx) => (
            <motion.div key={date} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: dayIdx * 0.06 }}>
              {/* Day label */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ background:'var(--sig)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#000', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {date === 'unscheduled' ? 'Unscheduled' : (() => {
                    const d = new Date(date + 'T00:00');
                    return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
                  })()}
                </div>
                <div style={{ flex:1, height:1, background:'#111' }} />
                <span style={{ fontSize:11, color:'#333' }}>{dayStops.length} stop{dayStops.length!==1?'s':''}</span>
              </div>

              {/* Stops */}
              <div style={{ paddingLeft:12, borderLeft:'2px solid #111', display:'flex', flexDirection:'column', gap:12 }}>
                {dayStops.map((s, si) => (
                  <motion.div key={s.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: dayIdx * 0.06 + si * 0.04 }}
                    style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{ICONS[s.category] || '📍'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'#e5e5e5' }}>{s.title}</div>
                      {s.location && <div style={{ fontSize:12, color:'#555', marginTop:3 }}>📌 {s.location}</div>}
                      {s.notes && <div style={{ fontSize:12, color:'#444', marginTop:6, lineHeight:1.5, borderTop:'1px solid #111', paddingTop:6 }}>{s.notes}</div>}
                    </div>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#333', flexShrink:0, marginTop:4 }}>{s.category}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
