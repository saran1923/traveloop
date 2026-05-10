import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Create profile row
        if (data.user) {
           const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, name });
           if (profileError) console.error('Error creating profile:', profileError);
        }
      }
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-base font-body">
      {/* LEFT — destination photo */}
      <div className="relative hidden lg:block overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsla(220,18%,7%,0.6)] to-[hsla(38,60%,20%,0.3)]" />
        
        <div className="relative h-full flex flex-col justify-between p-12">
          <div>
            <span className="font-display text-4xl font-extrabold text-white tracking-tight">
              Traveloop
            </span>
            <p className="mt-4 text-lg text-white/70 max-w-xs leading-relaxed">
              Plan smarter. Travel deeper. Your ultimate companion for global exploration.
            </p>
          </div>

          <div className="relative h-32">
            {['Rome', 'Kyoto', 'Marrakech', 'Reykjavik'].map((city, i) => (
              <motion.div key={city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [0, 0.4, 0], y: [20, 0, -20] }}
                transition={{ duration: 4, delay: i * 1.2, repeat: Infinity, repeatDelay: 2 }}
                className="absolute font-display text-2xl text-sig font-bold pointer-events-none"
                style={{ left: `${i * 25}%`, bottom: 0 }}
              >
                {city}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Start your journey'}
            </h1>
            <p className="mt-2 text-secondary">
              {mode === 'login' ? 'Sign in to continue your adventures' : 'Create a free account to start planning'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth */}
            <button 
              onClick={handleGoogle} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-elevated border border-border rounded-xl text-primary font-medium hover:bg-surface transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-base px-3 text-muted">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    placeholder="John Doe" 
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-primary focus:border-sig focus:outline-none transition-colors duration-200"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Email Address</label>
                <input 
                  placeholder="name@example.com" 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-primary focus:border-sig focus:outline-none transition-colors duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Password</label>
                <input 
                  placeholder="••••••••" 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-primary focus:border-sig focus:outline-none transition-colors duration-200"
                />
              </div>

              {error && (
                <p className="text-danger text-sm font-medium animate-pulse">
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 bg-sig text-black font-display font-bold text-lg rounded-xl shadow-sig-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-secondary pt-4">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sig font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
