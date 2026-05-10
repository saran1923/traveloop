import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
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
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-primary">My Trips</h1>
          <p className="text-secondary mt-2">Your collection of past and future adventures.</p>
        </div>
        <Link to="/trips/new" className="px-6 py-3 bg-sig text-black font-bold rounded-xl hover:scale-105 transition-transform">
          + New Trip
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="h-64 bg-surface rounded-2xl border border-border"></div>
          <div className="h-64 bg-surface rounded-2xl border border-border"></div>
          <div className="h-64 bg-surface rounded-2xl border border-border"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDEiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay"></div>
          <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center bg-elevated mb-6 relative z-10 group-hover:border-sig/50 transition-colors duration-500">
            <span className="text-3xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🗺️</span>
          </div>
          <h3 className="text-2xl font-display font-bold text-primary mb-3 relative z-10">The map is empty</h3>
          <p className="text-secondary max-w-md text-center mb-8 relative z-10">
            You don't have any trips logged yet. Use our AI Copilot to generate a bespoke itinerary for your next destination.
          </p>
          <Link to="/trips/new" className="relative z-10 px-8 py-3 bg-sig text-charcoal font-bold rounded-lg hover:bg-sig/90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,183,3,0.3)] hover:shadow-[0_0_30px_rgba(255,183,3,0.5)]">
            Plan an Expedition
          </Link>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {trips.map((trip) => (
            <motion.div 
              key={trip.id}
              variants={cardVariants}
              className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:border-sig/50 transition-all duration-300"
            >
              <Link to={`/trips/${trip.id}/build`} className="block">
                <div className="h-48 bg-elevated relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  {trip.cover_url ? (
                    <img src={trip.cover_url} alt={trip.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface/50 flex items-center justify-center text-5xl">
                      {trip.mood_emoji || '✈️'}
                    </div>
                  )}
                  {trip.mood_emoji && trip.cover_url && (
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-2xl z-20">
                      {trip.mood_emoji}
                    </div>
                  )}
                </div>
                
                <div className="p-6 border-l-4" style={{ borderColor: trip.mood_color || 'var(--sig)' }}>
                  <h3 className="text-2xl font-display font-bold text-primary group-hover:text-sig transition-colors">
                    {trip.name}
                  </h3>
                  <p className="text-secondary mt-1 text-sm font-medium">
                    {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Dates TBD'}
                    {trip.end_date ? ` - ${new Date(trip.end_date).toLocaleDateString()}` : ''}
                  </p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">
                      {trip.stops?.[0]?.count || 0} stops
                    </span>
                    <button className="text-sig font-bold text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      View Itinerary →
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
