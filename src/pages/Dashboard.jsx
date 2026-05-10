import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

/* ── Hardcoded recommended destinations (from guide) ── */
const DESTINATIONS = [
  {
    name: 'Paris',      country: 'France',       emoji: '🗼',
    costIndex: 3,       vibe: 'Romance & High Art',
    accent: '210, 80%, 55%',  h: '210',
  },
  {
    name: 'Kyoto',      country: 'Japan',        emoji: '⛩️',
    costIndex: 3,       vibe: 'Temples & Zen',
    accent: '350, 75%, 58%',  h: '350',
  },
  {
    name: 'Cape Town',  country: 'South Africa', emoji: '🌊',
    costIndex: 2,       vibe: 'Coast & Mountains',
    accent: '185, 80%, 45%',  h: '185',
  },
  {
    name: 'Cartagena',  country: 'Colombia',     emoji: '🏛️',
    costIndex: 1,       vibe: 'Color & Culture',
    accent: '25, 90%, 55%',   h: '25',
  },
  {
    name: 'Reykjavik',  country: 'Iceland',      emoji: '🌌',
    costIndex: 4,       vibe: 'Aurora & Wilderness',
    accent: '265, 70%, 60%',  h: '265',
  },
];

const TICKER = [
  'Paris', 'Kyoto', 'Cape Town', 'Cartagena', 'Reykjavik',
  'Santorini', 'Marrakech', 'Tokyo', 'Bali', 'Prague',
  'Buenos Aires', 'Petra', 'Lisbon', 'Dubrovnik',
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

function CostDots({ count }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="text-xs font-black"
          style={{ color: i <= count ? 'var(--sig)' : 'hsla(38,92%,58%,0.2)' }}
        >₹</span>
      ))}
    </span>
  );
}

export default function Dashboard() {
  const [profile,     setProfile]     = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [greeting,    setGreeting]    = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12)      setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else                setGreeting('Good evening');
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (p) setProfile(p);
        const { data: t } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3);
        if (t) setRecentTrips(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-2/3 bg-surface rounded-lg" />
        <div className="h-4 w-40 bg-surface rounded" />
        <div className="h-72 bg-surface rounded-2xl border border-border" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-56 bg-surface rounded-xl border border-border" />)}
        </div>
      </div>
    );
  }

  const name = profile?.name || 'Explorer';

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-10">

      {/* ── HEADER ── */}
      <motion.header variants={item} className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-sig mb-1">{greeting}</p>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-primary leading-tight">
          Welcome back, {name}
        </h1>
        <p className="text-secondary mt-1">Where will you wander next?</p>
      </motion.header>

      {/* ── MARQUEE TICKER ── */}
      <motion.div variants={item} className="overflow-hidden border-y border-border py-3 -mx-4 md:-mx-8 px-0">
        <div className="flex gap-0 animate-marquee whitespace-nowrap w-max">
          {[...TICKER, ...TICKER].map((city, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted">{city}</span>
              <span className="text-sig text-xs">✦</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── HERO STRIP — "Plan Your Expedition" ── */}
      <motion.section
        variants={item}
        className="relative group overflow-hidden rounded-2xl border border-border bg-surface min-h-[300px] flex items-end p-8 md:p-12"
      >
        {/* Ambient amber orb */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, hsla(38,92%,58%,0.13) 0%, transparent 70%)' }}
        />
        {/* Diagonal sheen */}
        <div
          className="absolute top-0 right-0 w-2/5 h-full -skew-x-6 transform translate-x-16 group-hover:translate-x-10 transition-all duration-700"
          style={{ background: 'linear-gradient(135deg, hsla(38,92%,58%,0.04) 0%, transparent 80%)' }}
        />
        {/* Eyebrow label */}
        <div className="absolute top-8 left-8 md:left-12 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sig animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-sig">Next Expedition</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-8 w-full">
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-primary leading-[1.05]"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
              Where does<br />
              <span style={{ color: 'var(--sig)' }}>your story</span><br />
              begin?
            </h2>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-3 px-8 py-4 bg-sig text-black font-display font-bold text-base rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
            style={{ boxShadow: 'var(--glow-sm)' }}
          >
            Begin Planning
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </motion.section>

      {/* ── RECENT JOURNEYS ── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <span className="text-sig">●</span> Recent Journeys
          </h2>
          <Link to="/trips" className="text-xs font-bold uppercase tracking-widest text-muted hover:text-sig transition-colors">
            View All →
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[220px]">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, hsla(38,92%,58%,0.04) 0%, transparent 70%)' }} />
            <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center bg-elevated mb-5 relative z-10 group-hover:border-sig/50 transition-colors duration-500">
              <span className="text-2xl grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🌍</span>
            </div>
            <p className="text-secondary text-center mb-6 relative z-10 max-w-xs">
              Your travel history is a blank canvas — time to plan your first curated itinerary.
            </p>
            <Link to="/trips/new" className="relative z-10 px-6 py-2 border border-border text-sm font-bold uppercase tracking-widest rounded-lg hover:border-sig hover:text-sig transition-all duration-300">
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTrips.map(trip => (
              <Link
                to={`/trips/${trip.id}/build`}
                key={trip.id}
                className="group bg-surface border border-border rounded-xl overflow-hidden card-glow block"
              >
                <div className="h-40 bg-elevated relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                  {trip.cover_url
                    ? <img src={trip.cover_url} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">{trip.mood_emoji || '✈️'}</div>
                  }
                </div>
                <div className="p-5" style={{ borderLeft: `3px solid ${trip.mood_color || 'var(--sig)'}` }}>
                  <h3 className="font-display font-bold text-lg group-hover:text-sig transition-colors">{trip.name}</h3>
                  <p className="text-xs text-muted mt-1 uppercase tracking-widest">
                    {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'Dates TBD'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* ── EXPLORE THE WORLD — Bento destinations ── */}
      <motion.section variants={item}>
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-xl font-display font-bold">✦ Explore the World</h2>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted">Curated Destinations</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gridTemplateRows: 'auto auto auto' }}>

          {/* Paris — FEATURED (spans 2 rows on md) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-2 md:col-span-1 md:row-span-2 relative overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer group min-h-[220px] md:min-h-[360px] flex flex-col justify-end p-6"
            style={{ boxShadow: 'none', transition: 'box-shadow 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 40px hsla(${DESTINATIONS[0].h},70%,50%,0.2), 0 8px 40px rgba(0,0,0,0.4)`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: `radial-gradient(ellipse at top left, hsla(${DESTINATIONS[0].h},60%,20%,0.7) 0%, var(--bg-surface) 70%)` }} />
            <div className="absolute top-5 right-5 animate-float text-5xl pointer-events-none">{DESTINATIONS[0].emoji}</div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted mb-1">{DESTINATIONS[0].country}</p>
              <h3 className="font-display font-extrabold text-3xl text-primary mb-1">{DESTINATIONS[0].name}</h3>
              <p className="text-secondary text-sm italic mb-3">{DESTINATIONS[0].vibe}</p>
              <CostDots count={DESTINATIONS[0].costIndex} />
            </div>
          </motion.div>

          {/* Kyoto & Cape Town — Right column */}
          {DESTINATIONS.slice(1, 3).map(dest => (
            <motion.div
              key={dest.name}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer group min-h-[168px] flex flex-col justify-end p-5"
              style={{ boxShadow: 'none', transition: 'box-shadow 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px hsla(${dest.h},70%,50%,0.18), 0 6px 30px rgba(0,0,0,0.4)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: `radial-gradient(ellipse at top right, hsla(${dest.h},55%,18%,0.7) 0%, var(--bg-surface) 70%)` }} />
              <div className="absolute top-4 right-4 text-3xl pointer-events-none group-hover:scale-110 transition-transform duration-300">{dest.emoji}</div>
              <div className="relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted mb-0.5">{dest.country}</p>
                <h3 className="font-display font-bold text-lg text-primary">{dest.name}</h3>
                <CostDots count={dest.costIndex} />
              </div>
            </motion.div>
          ))}

          {/* Cartagena & Reykjavik — Bottom row */}
          {DESTINATIONS.slice(3, 5).map(dest => (
            <motion.div
              key={dest.name}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface cursor-pointer group min-h-[140px] flex flex-col justify-end p-5"
              style={{ boxShadow: 'none', transition: 'box-shadow 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px hsla(${dest.h},70%,50%,0.18), 0 6px 30px rgba(0,0,0,0.4)`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: `radial-gradient(ellipse at bottom left, hsla(${dest.h},55%,18%,0.7) 0%, var(--bg-surface) 70%)` }} />
              <div className="absolute top-4 right-4 text-3xl pointer-events-none group-hover:scale-110 transition-transform duration-300">{dest.emoji}</div>
              <div className="relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted mb-0.5">{dest.country}</p>
                <h3 className="font-display font-bold text-lg text-primary">{dest.name}</h3>
                <CostDots count={dest.costIndex} />
              </div>
            </motion.div>
          ))}

          {/* View All — sixth slot */}
          <Link
            to="/explore"
            className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-transparent cursor-pointer group min-h-[140px] flex flex-col items-center justify-center p-5 hover:border-sig/40 transition-colors duration-300"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</span>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted group-hover:text-sig transition-colors">Explore More</span>
            <span className="text-sig mt-1 text-lg">→</span>
          </Link>

        </div>
      </motion.section>

    </motion.div>
  );
}
