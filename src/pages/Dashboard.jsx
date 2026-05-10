import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch recent trips
        const { data: tripsData } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (tripsData) setRecentTrips(tripsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <header>
          <div className="h-10 w-3/4 max-w-sm bg-surface rounded-lg"></div>
          <div className="h-4 w-48 bg-surface rounded-lg mt-4"></div>
        </header>
        <div className="h-64 w-full bg-surface rounded-2xl border border-border"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 bg-surface rounded-xl border border-border"></div>
          <div className="h-56 bg-surface rounded-xl border border-border"></div>
          <div className="h-56 bg-surface rounded-xl border border-border"></div>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || 'Explorer';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-display font-extrabold text-primary">
          Welcome back, {displayName}
        </h1>
        <p className="text-secondary mt-2">Where will you wander next?</p>
      </header>

      {/* Hero Strip */}
      <section className="relative group overflow-hidden rounded-2xl border border-sig/20 p-8 bg-gradient-to-br from-sig/10 via-surface to-base shadow-lg">
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="bg-sig text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Adventure Awaits
          </div>
          <h2 className="text-3xl font-display font-bold">Plan your next expedition</h2>
          <p className="text-secondary max-w-md">
            Use our AI-powered travel planner to discover hidden gems and optimize your itinerary.
          </p>
          <Link to="/trips/new" className="mt-4 px-6 py-3 bg-sig text-black font-bold rounded-lg hover:scale-105 transition-transform duration-200 block text-center">
            Start Planning
          </Link>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-full bg-sig/5 -skew-x-12 transform translate-x-20 group-hover:translate-x-16 transition-transform duration-700" />
      </section>

      {/* Recent Trips Section */}
      <section>
        <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <span className="text-sig">●</span> Recent Journeys
        </h3>
        
        {recentTrips.length === 0 ? (
          <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDEiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay"></div>
            <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center bg-elevated mb-6 relative z-10 group-hover:border-sig/50 transition-colors duration-500">
              <span className="text-2xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🌍</span>
            </div>
            <h4 className="text-xl font-display font-bold text-primary mb-3 relative z-10">No expeditions yet</h4>
            <p className="text-secondary max-w-sm text-center mb-8 relative z-10">
              Your travel history is a blank canvas. It's time to start planning your first curated itinerary.
            </p>
            <Link to="/trips/new" className="relative z-10 px-6 py-2 bg-transparent border border-border text-primary text-sm tracking-widest uppercase font-bold rounded-lg hover:border-sig hover:text-sig transition-all duration-300">
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <Link to={`/trips/${trip.id}/build`} key={trip.id} className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-sig/50 transition-colors duration-300 block">
                <div className="h-40 bg-elevated relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                   {trip.cover_url ? (
                     <img src={trip.cover_url} alt={trip.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-surface/50 flex items-center justify-center text-4xl">
                       {trip.mood_emoji || '✈️'}
                     </div>
                   )}
                   {trip.mood_emoji && trip.cover_url && (
                     <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-xl z-20">
                       {trip.mood_emoji}
                     </div>
                   )}
                </div>
                <div className="p-5" style={{ borderLeft: `4px solid ${trip.mood_color || 'var(--sig)'}` }}>
                  <h4 className="font-display font-bold text-lg group-hover:text-sig transition-colors">{trip.name}</h4>
                  <p className="text-xs text-muted mt-1 uppercase tracking-widest">
                    {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Dates TBD'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
