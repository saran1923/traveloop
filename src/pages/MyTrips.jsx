import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/* Uses each trip's mood_color for a personalized glow */
function TripCard({ trip }) {
  const accentColor = trip.mood_color || 'var(--sig)';
  const glowColor   = trip.mood_color
    ? `${trip.mood_color}33` // ~20% opacity
    : 'hsla(38,92%,58%,0.15)';

  return (
    <motion.div
      variants={cardVariants}
      className="group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-400"
      style={{ transition: 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 35px ${glowColor}, 0 8px 40px rgba(0,0,0,0.4)`;
        e.currentTarget.style.borderColor = `${accentColor}55`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Link to={`/trip/${trip.id}/view`} className="block">
        {/* Card image / emoji area */}
        <div className="h-48 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
          {trip.cover_url ? (
            <img
              src={trip.cover_url}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `${trip.mood_color || 'var(--bg-elevated)'}22` }}>
              <span className="font-display font-extrabold select-none pointer-events-none" style={{ fontSize: '6rem', lineHeight: 1, color: `${trip.mood_color || 'var(--sig)'}35` }}>
                {trip.name?.[0] ?? 'T'}
              </span>
            </div>
          )}

          {/* Action: View on hover */}
          <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-bold uppercase tracking-widest text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              View →
            </span>
          </div>
        </div>

        {/* Card body with mood-color accent bar */}
        <div className="p-5 pt-4" style={{ borderLeft: `3px solid ${accentColor}` }}>
          <h3 className="font-display font-bold text-xl text-primary group-hover:text-sig transition-colors duration-300 leading-tight">
            {trip.name}
          </h3>
          <p className="text-xs text-muted mt-1.5 uppercase tracking-widest font-medium">
            {trip.start_date
              ? new Date(trip.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Dates TBD'}
            {trip.end_date ? ` — ${new Date(trip.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {trip.ai_vibe_summary ? `"${trip.ai_vibe_summary.slice(0,38)}…"` : 'No vibe yet'}
            </span>
          </div>
        </div>
      </Link>
      {/* Quick links */}
      <div style={{ display:'flex', gap:6, padding:'0 18px 14px', flexWrap:'wrap' }}>
        {[['Build','build'],['Budget','budget'],['Packing','packing'],['Notes','notes']].map(([label,sub]) => (
          <Link key={sub} to={`/trip/${trip.id}/${sub}`}
            style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'#444', padding:'4px 10px', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:6, textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--sig)';e.currentTarget.style.borderColor='var(--sig)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='#444';e.currentTarget.style.borderColor='#1a1a1a';}}>
            {label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function MyTrips() {
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('trips')
          .select('*, stops(count)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-sig mb-1">Your Collection</p>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-primary leading-tight">My Trips</h1>
          <p className="text-secondary mt-2">Past adventures &amp; future expeditions.</p>
        </div>
        <Link
          to="/trips/new"
          className="shrink-0 px-5 py-2.5 bg-sig text-black font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform"
          style={{ boxShadow: 'var(--glow-xs)' }}
        >
          + New Trip
        </Link>
      </header>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden bg-surface">
              <div className="h-48 bg-elevated" />
              <div className="p-5 space-y-3 border-l-2 border-border">
                <div className="h-5 w-3/4 bg-elevated rounded" />
                <div className="h-3 w-1/2 bg-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        /* Empty state */
        <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at center, hsla(38,92%,58%,0.05) 0%, transparent 70%)' }} />
          {/* Editorial empty state — oversized typographic watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="font-display font-extrabold leading-none text-sig"
              style={{ fontSize: '18rem', opacity: 0.03 }}
            >?</span>
          </div>
          <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center bg-elevated mb-6 relative z-10 group-hover:border-sig/40 transition-colors duration-500">
            <svg className="w-8 h-8 text-muted group-hover:text-sig transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-display font-bold text-primary mb-3 relative z-10">The map is empty</h3>
          <p className="text-secondary max-w-md text-center mb-8 relative z-10">
            You don't have any trips logged yet. Use the AI Copilot to generate a bespoke itinerary for your next destination.
          </p>
          <Link
            to="/trips/new"
            className="relative z-10 px-8 py-3 bg-sig text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300"
            style={{ boxShadow: 'var(--glow-sm)' }}
          >
            Plan an Expedition
          </Link>
        </div>
      ) : (
        /* Trip cards grid */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
        </motion.div>
      )}
    </div>
  );
}
