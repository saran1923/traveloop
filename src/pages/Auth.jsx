import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const FLOAT_CITIES = ['Rome', 'Kyoto', 'Marrakech', 'Reykjavik', 'Lisbon', 'Cartagena'];

export default function Auth() {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
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
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, name });
          if (profileError) console.error('Profile error:', profileError);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen font-body" style={{ background: 'var(--bg-base)' }}>

      {/* ── LEFT — Hero panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000"
            alt="destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, hsla(220,18%,5%,0.88) 0%, hsla(38,60%,10%,0.5) 100%)'
          }} />
        </div>

        {/* Ambient amber orb */}
        <div className="absolute bottom-24 right-12 w-72 h-72 rounded-full pointer-events-none animate-glow-pulse"
             style={{ background: 'radial-gradient(circle, hsla(38,92%,58%,0.18) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sig flex items-center justify-center" style={{ boxShadow: 'var(--glow-sm)' }}>
              <span className="text-black font-black text-sm">T</span>
            </div>
            <span className="font-display text-3xl font-extrabold text-white tracking-tight">raveloop</span>
          </div>
          <p className="text-white/60 max-w-xs leading-relaxed text-sm">
            Plan smarter. Travel deeper. Your ultimate companion for global exploration.
          </p>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="w-10 h-0.5 bg-sig mb-4" />
          <blockquote className="font-display text-3xl font-extrabold text-white leading-tight mb-4">
            Every journey<br />begins with a<br />
            <span style={{ color: 'var(--sig)' }}>single decision.</span>
          </blockquote>

          {/* Floating city names */}
          <div className="relative h-12 overflow-hidden mt-6">
            {FLOAT_CITIES.map((city, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: [0, 0.6, 0], y: [16, 0, -16] }}
                transition={{
                  duration: 3.5, delay: i * 1.4,
                  repeat: Infinity, repeatDelay: FLOAT_CITIES.length * 1.4 - 3.5,
                  ease: 'easeInOut'
                }}
                className="absolute font-display text-xl font-bold"
                style={{ color: 'var(--sig)', left: `${(i % 4) * 22}%` }}
              >
                {city}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form panel ── */}
      <div className="relative flex items-center justify-center p-8 lg:p-16 overflow-hidden">

        {/* Subtle ambient glow behind the form */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, hsla(38,92%,58%,0.06) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mode toggle eyebrow */}
          <div className="inline-flex rounded-full p-1 bg-surface border border-border mb-8">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  mode === m
                    ? 'bg-sig text-black'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h1 className="font-display text-4xl font-extrabold text-primary leading-tight">
                {mode === 'login'
                  ? <>Welcome<br />back.</>
                  : <>Start your<br />journey.</>}
              </h1>
              <p className="text-secondary mt-2">
                {mode === 'login'
                  ? 'Sign in to continue your adventures'
                  : 'Create a free account to start planning'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-elevated border border-border rounded-xl text-primary font-medium hover:border-sig/40 transition-all duration-300 mb-6"
            style={{ transition: 'border-color 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--glow-xs)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="mx-4 text-[10px] font-bold uppercase tracking-widest text-muted">or email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.35em] text-muted ml-1">Full Name</label>
                <input
                  type="text" required placeholder="Jane Doe"
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-primary font-medium transition-all duration-300 outline-none"
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    transition: 'border-color 0.3s, box-shadow 0.3s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--sig)'; e.target.style.boxShadow = 'var(--glow-xs)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.35em] text-muted ml-1">Email Address</label>
              <input
                type="email" required placeholder="name@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-primary font-medium outline-none"
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--sig)'; e.target.style.boxShadow = 'var(--glow-xs)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.35em] text-muted ml-1">Password</label>
              <input
                type="password" required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-primary font-medium outline-none"
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--sig)'; e.target.style.boxShadow = 'var(--glow-xs)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--danger)' }}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-display font-bold text-black text-lg rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--sig)', boxShadow: loading ? 'none' : 'var(--glow-sm)' }}
            >
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-secondary mt-6 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="font-bold hover:underline"
              style={{ color: 'var(--sig)' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
