# 🎨 SANTHOSH — Frontend Lead + AI Copilot UI
### Traveloop Hackathon | Your Personal Build Guide

---

## 🎯 YOUR MISSION

You own the **design system**, the **first impression**, and the **AI magic** that judges will love. Every screen the judge sees first — Login, Dashboard, My Trips — is yours. You also build the AI Copilot sidebar that makes Traveloop feel intelligent.

**Your output = the thing that makes judges say "wow" before they even click anything.**

---

## 🎨 DESIGN DIRECTION — "Midnight Explorer"

**Aesthetic archetype:** Dark editorial with warm amber accents. Inspired by National Geographic magazine layout meets high-end travel journal. Think: deep charcoal backgrounds, warm amber/saffron as the signature color, a distinctive serif display font for destination names.

**The one thing judges will remember:** *The animated route map + the glowing amber AI copilot sidebar.*

### Design Tokens (tokens.css)

```css
:root {
  /* Backgrounds */
  --bg-base: hsl(220, 18%, 7%);          /* near-black blue-charcoal */
  --bg-surface: hsl(220, 14%, 11%);      /* card surface */
  --bg-elevated: hsl(220, 12%, 15%);     /* modal, dropdown */

  /* The ONE signature color — warm amber */
  --sig: hsl(38, 92%, 58%);             /* #F5A623 equivalent */
  --sig-dim: hsl(38, 60%, 40%);
  --sig-glow: hsla(38, 92%, 58%, 0.15);

  /* Text */
  --text-primary: hsl(220, 10%, 92%);
  --text-secondary: hsl(220, 8%, 55%);
  --text-muted: hsl(220, 6%, 35%);

  /* Borders */
  --border: hsl(220, 10%, 18%);
  --border-active: hsl(38, 92%, 58%);

  /* Functional colors */
  --success: hsl(145, 60%, 45%);
  --danger: hsl(4, 80%, 58%);
  --info: hsl(210, 70%, 55%);

  /* Typography Scale — Perfect Fourth */
  --text-xs:   0.563rem;
  --text-sm:   0.75rem;
  --text-base: 1rem;
  --text-lg:   1.333rem;
  --text-xl:   1.777rem;
  --text-2xl:  2.369rem;
  --text-3xl:  3.157rem;

  /* Spacing — 8pt */
  --sp-1: 0.5rem; --sp-2: 1rem; --sp-3: 1.5rem;
  --sp-4: 2rem; --sp-6: 3rem; --sp-8: 4rem;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Fonts (index.html head)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
```

- **Display (headings, city names):** `Syne` — geometric, commanding, unique
- **Body (all prose, labels, inputs):** `DM Sans` — warm, readable, slightly personality

---

## 📱 SCREENS YOU BUILD

### 1. Auth Screen (Login + Signup)

**Vibe:** A full-screen travel destination image (use a static gorgeous photo, e.g., Santorini at dusk) on the LEFT half, frosted dark panel on the RIGHT. NOT a centered form.

```jsx
// src/pages/Auth.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Create profile row
        await supabase.from('profiles').insert({ id: data.user.id, name })
      }
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      {/* LEFT — destination photo */}
      <div style={{
        background: 'url(/assets/hero-bg.jpg) center/cover',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, hsla(220,18%,7%,0.4) 0%, hsla(38,60%,20%,0.2) 100%)'
        }} />
        <div style={{ position: 'relative', padding: 'var(--sp-8)', color: 'var(--text-primary)' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
            Traveloop
          </span>
          <p style={{ marginTop: 'var(--sp-2)', color: 'hsla(220,10%,92%,0.7)', maxWidth: 320 }}>
            Plan smarter. Travel deeper.
          </p>
        </div>
        {/* Animated city names floating */}
        {['Rome', 'Kyoto', 'Marrakech', 'Reykjavik'].map((city, i) => (
          <motion.div key={city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 0.4, 0], y: [20, 0, -20] }}
            transition={{ duration: 4, delay: i * 1.2, repeat: Infinity, repeatDelay: 2 }}
            style={{
              position: 'absolute',
              left: `${20 + i * 15}%`, bottom: `${20 + i * 12}%`,
              fontFamily: 'Syne', fontSize: 'var(--text-lg)',
              color: 'var(--sig)', pointerEvents: 'none'
            }}
          >{city}</motion.div>
        ))}
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        background: 'var(--bg-base)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-6)'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <h1 style={{ fontFamily: 'Syne', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--sp-1)' }}>
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
            {mode === 'login' ? 'Sign in to your trips' : 'Create a free account'}
          </p>

          {/* Google OAuth */}
          <button onClick={handleGoogle} style={googleBtnStyle}>
            <img src="/assets/google.svg" width={18} alt="Google" />
            Continue with Google
          </button>

          <div style={dividerStyle}><span>or</span></div>

          {/* Fields */}
          {mode === 'signup' && (
            <input placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} style={inputStyle} />
          )}
          <input placeholder="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} />

          {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-2)' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={primaryBtnStyle}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'var(--sp-3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: 'var(--sig)', cursor: 'pointer' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)',
  fontFamily: 'DM Sans', fontSize: 'var(--text-base)', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}
// Add :focus border override via className + CSS
const primaryBtnStyle = {
  width: '100%', padding: '0.85rem',
  background: 'var(--sig)', border: 'none', borderRadius: 8,
  color: '#000', fontFamily: 'Syne', fontWeight: 700,
  fontSize: 'var(--text-base)', cursor: 'pointer'
}
const googleBtnStyle = {
  width: '100%', padding: '0.75rem',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)',
  fontFamily: 'DM Sans', fontSize: 'var(--text-base)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  marginBottom: 'var(--sp-3)', boxSizing: 'border-box'
}
const dividerStyle = {
  textAlign: 'center', position: 'relative',
  margin: 'var(--sp-2) 0', color: 'var(--text-muted)',
  fontSize: 'var(--text-sm)'
}
```

---

### 2. Dashboard / Home Screen

**Layout:** Left sidebar nav + main content area. Top: "Plan New Trip" hero strip with animated gradient border. Below: Recent Trips row. Below: Recommended Destinations grid (static curated list).

**Key visual:** Each destination card has a colored accent bar at the bottom whose color is the trip's `mood_color` field. Every card feels different.

```jsx
// Core layout shell — src/components/layout/AppShell.jsx
// Left sidebar with: Logo, nav links (Dashboard, My Trips, Explore, Profile)
// Right content area
// Persistent AI Copilot button (floating, bottom-right)
```

**Dashboard data to show:**
- `SELECT * FROM trips WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 3`
- Hardcoded recommended cities: Paris, Kyoto, Cape Town, Cartagena, Reykjavik (with emojis + cost index)

---

### 3. My Trips Screen

**Layout:** Masonry-like grid of trip cards. Each card shows:
- Trip name (Syne font, large)
- Date range
- City count ("3 stops")
- Mood emoji + mood color as left border accent
- Edit / View / Delete actions (appear on hover)
- Skeleton loaders while fetching

**Framer Motion:** Cards stagger-animate in with 0.05s delay per card.

```jsx
// Motion stagger pattern
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}
```

---

### 4. AI Copilot Sidebar

This is the most impressive feature. A slide-in panel (right side) that uses Gemini.

```jsx
// src/components/ai/AICopilot.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { askGemini } from '../../lib/gemini'

export default function AICopilot({ trip, currentStop }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const systemContext = `
    You are Traveloop's AI travel assistant. The user is planning a trip called "${trip?.name}".
    Current stop: ${currentStop?.city_name || 'Not selected'}.
    Trip dates: ${trip?.start_date} to ${trip?.end_date}.
    Be concise, specific, and enthusiastic. Suggest real activities. Format nicely.
    If asked for a packing list, return it as a JSON array.
  `

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const reply = await askGemini(systemContext, input)
    setMessages(prev => [...prev, { role: 'ai', text: reply }])
    setLoading(false)
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
          background: 'var(--sig)', border: 'none', borderRadius: '50%',
          width: 56, height: 56, cursor: 'pointer',
          boxShadow: '0 0 24px var(--sig-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: 24 }}>✨</span>
      </motion.button>

      {/* Slide-in panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
              background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
              zIndex: 200, display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ padding: 'var(--sp-3)', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--sig)' }}>
                  ✨ AI Copilot
                </span>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
                  Ask me anything about your trip
                </p>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {messages.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 36, marginBottom: 'var(--sp-2)' }}>🌍</div>
                  <p>Ask me to suggest activities, estimate costs, generate a packing list, or write a trip summary!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'var(--sig)' : 'var(--bg-elevated)',
                    color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                    padding: '0.6rem 0.9rem', borderRadius: 12,
                    maxWidth: '85%', fontSize: 'var(--text-sm)', lineHeight: 1.5
                  }}
                >{msg.text}</motion.div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--sig)', fontSize: 'var(--text-sm)' }}>
                  thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: 'var(--sp-2)', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 'var(--sp-1)' }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask AI copilot..."
                style={{ flex: 1, ...inputStyle, marginBottom: 0 }} />
              <button onClick={sendMessage}
                style={{ ...primaryBtnStyle, width: 'auto', padding: '0.75rem 1rem' }}>
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## 🤖 GEMINI INTEGRATION (your setup)

```js
// src/lib/gemini.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

export async function askGemini(systemPrompt, userMessage) {
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] }
        ],
        generationConfig: { maxOutputTokens: 500, temperature: 0.8 }
      })
    })
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
  } catch (e) {
    console.error('Gemini error:', e)
    return 'AI is resting. Try again in a moment!'
  }
}

// For mood/vibe generation (returns JSON)
export async function generateTripMood(tripName, cities) {
  const prompt = `For a trip called "${tripName}" visiting ${cities.join(', ')}, generate:
  1. A mood emoji (single emoji)
  2. A mood color as HSL CSS string (warm, unique, not too dark)
  3. A one-sentence "vibe summary" (poetic, travel-magazine style)
  Return ONLY valid JSON: { "emoji": "🌊", "color": "hsl(195, 70%, 45%)", "vibe": "..." }`
  
  const response = await askGemini('', prompt)
  try {
    const clean = response.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { emoji: '✈️', color: 'hsl(38, 92%, 58%)', vibe: 'An adventure waiting to unfold.' }
  }
}
```

---

## ✅ YOUR DAILY CHECKLIST

**Hour 1–2:** Design tokens CSS, font setup, AppShell layout, routing skeleton  
**Hour 2–4:** Auth page (login + signup + Google OAuth)  
**Hour 4–6:** Dashboard + My Trips screens (Supabase queries, trip cards, animations)  
**Hour 6–9:** AI Copilot sidebar (Gemini connection, message UI)  
**Hour 9–12:** Mood card generation, polish, animations pass  
**Hour 12–16:** Help team, fix cross-page styles, prepare demo flow  

---

## 🚫 DON'T DO

- ❌ No purple gradients. Not one.
- ❌ No Inter font. Syne + DM Sans only.
- ❌ No glassmorphism as primary surface.
- ❌ Don't call Gemini on every keystroke — only on button click.
- ❌ Don't block the UI while Gemini loads — show a spinner.

---

*You're the first thing judges see. Make it unforgettable.*
