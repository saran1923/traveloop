import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=85',
];

const QUOTES = [
  { line1: 'The world is', line2: 'too beautiful', line3: 'to stay home.' },
  { line1: 'Not all those', line2: 'who wander', line3: 'are lost.' },
  { line1: 'Every journey', line2: 'begins with a', line3: 'single step.' },
  { line1: 'Travel is the', line2: 'only thing you', line3: 'buy that enriches.' },
];

export default function Auth() {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [bgIdx, setBgIdx]       = useState(0);
  const [exiting, setExiting]   = useState(false);
  const navigate = useNavigate();

  // Rotate background every 6s
  useEffect(() => {
    const t = setInterval(() => setBgIdx(i => (i + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, name });
        }
      }
      // Cinematic exit before navigate
      setExiting(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  const quote = QUOTES[bgIdx];

  return (
    <motion.div
      className="fixed inset-0 flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={exiting ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: exiting ? 0.85 : 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── LEFT: Cinematic fullscreen photo panel ── */}
      <div className="hidden lg:flex relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={bgIdx}
            src={BG_IMAGES[bgIdx]}
            alt="destination"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </AnimatePresence>

        {/* Layered overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Logo top-left */}
        <div className="absolute top-10 left-12 z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-black"
               style={{ background: 'var(--sig)' }}>T</div>
          <span className="font-display text-2xl font-bold text-white tracking-tight">raveloop</span>
        </div>

        {/* Bottom-left quote */}
        <div className="absolute bottom-16 left-12 z-10 max-w-lg">
          <div className="w-12 h-0.5 mb-6" style={{ background: 'var(--sig)' }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-6xl font-bold text-white leading-[1.1] italic">
                {quote.line1}<br />
                <span style={{ color: 'var(--sig)' }}>{quote.line2}</span><br />
                {quote.line3}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-8">
            {BG_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setBgIdx(i)}
                className="h-0.5 rounded-full transition-all duration-500"
                style={{ width: bgIdx === i ? 32 : 16, background: bgIdx === i ? 'var(--sig)' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <motion.div
        className="w-full lg:w-[440px] flex flex-col justify-center px-10 py-14 relative overflow-hidden"
        style={{ background: '#080808' }}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Orange ambient orb behind form */}
        <div
          className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, hsla(22,92%,52%,0.12) 0%, transparent 70%)' }}
        />

        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-12 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-black"
               style={{ background: 'var(--sig)' }}>T</div>
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--sig)' }}>raveloop</span>
        </div>

        {/* Desktop logo */}
        <div className="hidden lg:flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-black"
               style={{ background: 'var(--sig)' }}>T</div>
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--sig)' }}>raveloop</span>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 mb-8 border border-[#1a1a1a]" style={{ background: '#0d0d0d' }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300"
              style={mode === m
                ? { background: 'var(--sig)', color: '#000' }
                : { color: 'var(--text-muted)' }
              }
            >{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              {mode === 'login' ? <>Welcome<br />back.</> : <>Start your<br />journey.</>}
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {mode === 'login' ? 'Sign in to continue your adventures' : 'Create a free account to begin'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium mb-5 transition-all duration-300 border"
          style={{ background: '#111', borderColor: '#222', color: 'var(--text-primary)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sig)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
              <input
                type="text" required placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ background: '#111', border: '1px solid #1e1e1e', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = 'var(--sig)'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email" required placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: '#111', border: '1px solid #1e1e1e', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--sig)'}
              onBlur={e => e.target.style.borderColor = '#1e1e1e'}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password" required placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: '#111', border: '1px solid #1e1e1e', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--sig)'}
              onBlur={e => e.target.style.borderColor = '#1e1e1e'}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm flex items-center gap-2" style={{ color: 'var(--danger)' }}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </motion.p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 mt-2"
            style={{ background: 'var(--sig)', color: '#000', boxShadow: loading ? 'none' : 'var(--glow-sm)' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = 'var(--glow-md)')}
            onMouseLeave={e => e.currentTarget.style.boxShadow = loading ? 'none' : 'var(--glow-sm)'}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="font-semibold hover:underline"
            style={{ color: 'var(--sig)' }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
