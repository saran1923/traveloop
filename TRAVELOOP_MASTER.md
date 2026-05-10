# 🌍 TRAVELOOP — HACKATHON MASTER PLAN
### Team: Santhosh · Sashidhar · Sanjay · Saran | Odoo Hackathon

---

## 🏆 WIN CONDITION

The judges will have seen 20+ basic travel planners. **Traveloop wins by being the one that feels alive.** The differentiator is a real AI layer that doesn't just generate text — it *reasons about your trip* — wrapped in a UI that looks like a design studio made it.

**Our killer angle:** *"Traveloop doesn't just plan your trip. It thinks with you."*

---

## 🧠 CREATIVE ADDITIONS (beyond the problem statement)

These are the features that push us from "good submission" to "winner":

### 1. 🤖 AI Travel Copilot (Gemini 2.5 Flash)
A persistent AI sidebar on every screen that:
- Suggests activities based on the cities + dates you've chosen
- Auto-fills budget estimates by city using embedded knowledge
- Detects schedule conflicts ("You have only 1 day in Rome but 6 activities — want me to trim?")
- Generates a one-paragraph "trip vibe" summary for sharing

### 2. 🗺️ Live Route Visualizer
- Animated SVG/Canvas path connecting stops in order, drawn as the user adds cities
- Shows approximate travel time between stops (using free Open Route Service API or hardcoded estimates)
- Color-coded by transport type (flight / train / drive)

### 3. 📊 Smart Budget Pulse
- Real-time animated budget bar that updates as activities are added
- Uses a pre-built cost index table (hardcoded per city) to estimate costs — no paid API needed
- "Over budget" shake animation with AI suggestion to cut specific items

### 4. 🎴 Mood Board Trip Cards
- Each trip gets an auto-generated color palette + emoji mood tag via Gemini
- Trip cards on My Trips page use these palettes — every card looks unique and personal
- Shareable public page uses the palette as the theme

### 5. 🔔 Packing AI Assist
- Gemini generates packing list based on destinations + duration + season
- User can accept/reject individual items
- Auto-categorized into: Essentials / Clothes / Electronics / Documents

### 6. 📖 AI Journal Prompt
- On the Trip Notes screen, if the user hasn't typed in 10s, Gemini prompts them with a context-aware question ("What was the highlight of your Rome stop?")
- Feels like a travel companion, not a note-taking box

---

## 🛠️ TECH STACK (100% Free Tier)

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | React + Vite | Fast, team knows it, rich ecosystem |
| **Styling** | Tailwind CSS + Custom CSS vars | Utility + design tokens for the elite UI |
| **Backend / DB** | Supabase (Free tier) | PostgreSQL, Auth, Realtime, Storage — all in one |
| **AI** | Gemini 2.5 Flash (Free: 250 RPD, 10 RPM) | Best free AI for our use case, multimodal |
| **Maps/Route** | Leaflet.js + OpenStreetMap | 100% free, no API key needed |
| **Icons** | Lucide React | Free, beautiful, tree-shakeable |
| **Charts** | Recharts | Free, React-native, clean |
| **Fonts** | Google Fonts (Syne + DM Sans) | Free, distinctive, not generic |
| **Hosting** | Vercel (Free tier) | Free, auto-deploys from GitHub, fast CDN |
| **Auth** | Supabase Auth | Built-in, handles Google OAuth free |
| **Storage** | Supabase Storage | Free 1GB for trip cover photos |
| **Animation** | Framer Motion (free) | Smooth, declarative React animations |

### ⚠️ Gemini Free Tier Strategy
- Gemini 2.5 Flash: 250 RPD, 10 RPM
- **Use only on-demand** (button click, not on every keystroke)
- Cache AI responses in Supabase to avoid repeated identical calls
- Use Gemini 2.5 Flash-Lite (1,000 RPD) for simpler tasks like packing list generation
- Implement graceful fallback: if rate limit hit, show pre-written suggestions

---

## 🗄️ DATABASE SCHEMA (Supabase / PostgreSQL)

```sql
-- Users (handled by Supabase Auth, extended with profile)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  start_date DATE,
  end_date DATE,
  total_budget NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  mood_emoji TEXT,
  mood_color TEXT,
  ai_vibe_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stops (cities within a trip)
CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country TEXT,
  start_date DATE,
  end_date DATE,
  position INTEGER,  -- for reordering
  cost_index NUMERIC DEFAULT 50,  -- 0-100 scale
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,  -- sightseeing, food, adventure, transport, stay
  cost NUMERIC DEFAULT 0,
  duration_hours NUMERIC,
  time_of_day TEXT,  -- morning, afternoon, evening
  notes TEXT,
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packing Items
CREATE TABLE packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,  -- essentials, clothes, electronics, documents
  is_packed BOOLEAN DEFAULT FALSE,
  is_ai_suggested BOOLEAN DEFAULT FALSE
);

-- Trip Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id),  -- optional, can be trip-level
  content TEXT,
  ai_prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (Supabase)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their trips" ON trips
  USING (auth.uid() = user_id);
CREATE POLICY "Public trips viewable by all" ON trips
  FOR SELECT USING (is_public = TRUE);
-- (Repeat RLS for stops, activities, packing_items, notes)
```

---

## 📁 REPOSITORY STRUCTURE

```
traveloop/
├── src/
│   ├── components/
│   │   ├── ui/              # Design system (Button, Card, Modal, Input...)
│   │   ├── layout/          # Navbar, Sidebar, PageShell
│   │   ├── map/             # RouteVisualizer, CityMarker
│   │   ├── ai/              # AICopilot, AIBudget, AIPacking
│   │   └── charts/          # BudgetBreakdown, CostPieChart
│   ├── pages/
│   │   ├── Auth.jsx         # Login + Signup
│   │   ├── Dashboard.jsx    # Home
│   │   ├── MyTrips.jsx      # Trip list
│   │   ├── CreateTrip.jsx   # New trip form
│   │   ├── ItineraryBuilder.jsx
│   │   ├── ItineraryView.jsx
│   │   ├── CitySearch.jsx
│   │   ├── ActivitySearch.jsx
│   │   ├── Budget.jsx
│   │   ├── Packing.jsx
│   │   ├── Notes.jsx
│   │   ├── Profile.jsx
│   │   └── PublicTrip.jsx   # Shared view
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   ├── gemini.js        # Gemini AI client + helpers
│   │   ├── cityData.js      # Cost index + coordinates for 100 cities
│   │   └── utils.js
│   ├── hooks/               # useTrip, useStops, useAI, useAuth
│   ├── store/               # Zustand global state
│   └── styles/
│       ├── tokens.css       # Design tokens (colors, typography, spacing)
│       └── animations.css   # Keyframes
├── supabase/
│   ├── migrations/          # All SQL migrations
│   └── seed.sql             # Sample cities + activity data
├── public/
├── .env.example
├── package.json
└── vite.config.js
```

---

## 🗓️ BUILD TIMELINE (Hackathon Sprint)

### Phase 1 — Foundation (Hours 1–3)
- [ ] Supabase project setup + schema migration
- [ ] Vite + React + Tailwind + Framer Motion setup
- [ ] Design token CSS variables (Santhosh leads)
- [ ] Supabase Auth (email + Google OAuth)
- [ ] Navigation shell + routing

### Phase 2 — Core Features (Hours 3–8)
- [ ] Login/Signup UI (Santhosh)
- [ ] Dashboard + My Trips (Santhosh)
- [ ] Create Trip form + Supabase write (Sanjay)
- [ ] Itinerary Builder — stops + activities CRUD (Sashidhar)
- [ ] City Search with embedded data (Sashidhar)
- [ ] Budget calculation + charts (Saran)

### Phase 3 — AI + Polish (Hours 8–14)
- [ ] Gemini AI Copilot sidebar (Santhosh)
- [ ] AI packing list generator (Saran)
- [ ] Route Visualizer with Leaflet (Sashidhar)
- [ ] Itinerary View screen (Sanjay)
- [ ] Public/Shared trip page (Sanjay)
- [ ] AI trip vibe + mood card generation (Santhosh)

### Phase 4 — Final Push (Hours 14–16)
- [ ] Animation pass (Santhosh)
- [ ] Bug fixes across all screens
- [ ] Vercel deploy + env variables
- [ ] Demo data seeded (2–3 sample trips)
- [ ] README + pitch preparation

---

## 🎤 DEMO SCRIPT (for judges)

1. **Login** — smooth animated login screen, Google OAuth in 2 clicks
2. **Dashboard** — show recommended destinations, existing trips with mood palettes
3. **Create Trip** — "Europe Summer 2025", add 3 cities, watch route animate on map
4. **Itinerary Builder** — add activities, AI copilot suggests 3 more, accept 2
5. **Budget Screen** — animated pie chart, "You're ₹4,200 over budget" alert, AI trims one activity
6. **Packing** — AI generates list in 2s, accept/reject items
7. **Share** — toggle public, copy link, show public view (no login needed)
8. **Notes** — AI journal prompt appears after 10s idle

---

## 🔑 ENV VARIABLES (.env)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 📌 TEAM ASSIGNMENTS SUMMARY

| Member | Primary Role | Screens |
|---|---|---|
| **Santhosh** | Frontend Lead + AI UI | Login, Dashboard, My Trips, AI Copilot, Design System |
| **Sashidhar** | Full-Stack (Stops + Map) | Itinerary Builder, City Search, Route Visualizer |
| **Sanjay** | Full-Stack (Trips + Share) | Create Trip, Itinerary View, Public Share page |
| **Saran** | Backend + Data + Budget | Budget screen, Packing, Notes, Supabase schema, Gemini integration |

---

*Built for the Odoo Hackathon. Strategy: ship fast, look stunning, think differently.*
