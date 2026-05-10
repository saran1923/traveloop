import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';

const CATEGORIES = [
  { label: 'Clothing & Gear',  icon: '👕', items: ['T-shirts','Pants','Jacket','Comfortable shoes','Sunglasses','Hat'] },
  { label: 'Toiletries',       icon: '🧴', items: ['Toothbrush','Toothpaste','Shampoo','Deodorant','Sunscreen','Moisturizer'] },
  { label: 'Electronics',      icon: '🔌', items: ['Phone charger','Power bank','Universal adapter','Earphones','Camera'] },
  { label: 'Documents',        icon: '📄', items: ['Passport','Visa printout','Travel insurance','Hotel bookings','Flight tickets'] },
  { label: 'Health & Safety',  icon: '💊', items: ['Pain relievers','Allergy medicine','Band-aids','Hand sanitizer','Masks'] },
  { label: 'Entertainment',    icon: '🎮', items: ['Book/e-reader','Travel games','Journal','Headphones'] },
];

const inp = { background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, color:'#e5e5e5', fontFamily:'Outfit,sans-serif', fontSize:13, padding:'10px 13px', outline:'none', width:'100%', boxSizing:'border-box' };
const btn = (x={}) => ({ fontFamily:'Outfit,sans-serif', fontWeight:700, cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s', ...x });

export default function Packing() {
  const { tripId } = useParams();
  const [trip,    setTrip]    = useState(null);
  const [items,   setItems]   = useState({});
  const [checked, setChecked] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiItems, setAiItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCat,  setNewCat]  = useState('Clothing & Gear');

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => data && setTrip(data));
    supabase.from('packing_items').select('*').eq('trip_id', tripId).then(({ data }) => {
      if (data) {
        const map = {};
        const ch  = {};
        data.forEach(d => { 
          if (!map[d.category]) map[d.category] = [];
          map[d.category].push({ id:d.id, name:d.name });
          if (d.checked) ch[d.id] = true;
        });
        setItems(map); setChecked(ch);
      }
    });
  }, [tripId]);

  // Init default items on first load
  useEffect(() => {
    if (Object.keys(items).length === 0 && trip) {
      const defaultMap = {};
      CATEGORIES.forEach(cat => { defaultMap[cat.label] = cat.items.map(name => ({ id: null, name })); });
      setItems(defaultMap);
    }
  }, [trip]);

  const toggle = async (id, catLabel, itemName) => {
    const key = id || `${catLabel}_${itemName}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
    if (id) await supabase.from('packing_items').update({ checked: !checked[id] }).eq('id', id);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const { data } = await supabase.from('packing_items').insert({ trip_id:tripId, name:newItem.trim(), category:newCat, checked:false }).select().single();
    const entry = data ? { id:data.id, name:data.name } : { id:null, name:newItem.trim() };
    setItems(p => ({ ...p, [newCat]: [...(p[newCat]||[]), entry] }));
    setNewItem('');
  };

  const generateAIPacking = async () => {
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a travel packing expert. Return ONLY a JSON array of strings. No markdown, no explanation.`;
    const prompt = `Trip: "${trip.name}". Duration: ${trip.start_date && trip.end_date ? Math.ceil((new Date(trip.end_date)-new Date(trip.start_date))/86400000)+1 : '?'} days.
Generate 10 unique packing items specifically for this trip that aren't common essentials. Return: ["item1","item2",...]`;
    const raw = await askGemini(sys, prompt);
    try {
      const clean = raw.replace(/```json|```/g,'').trim();
      setAiItems(JSON.parse(clean));
    } catch { setAiItems(['Compact umbrella','Travel towel','Padlock for hostel','Offline maps downloaded']); }
    setAiLoading(false);
  };

  const addAIItem = async (name) => {
    const { data } = await supabase.from('packing_items').insert({ trip_id:tripId, name, category:'AI Suggestions', checked:false }).select().single();
    const entry = data ? { id:data.id, name } : { id:null, name };
    setItems(p => ({ ...p, 'AI Suggestions': [...(p['AI Suggestions']||[]), entry] }));
    setAiItems(p => p.filter(i => i !== name));
  };

  const allItems  = Object.values(items).flat();
  const doneCount = allItems.filter(i => checked[i.id || `${Object.entries(items).find(([,v])=>v.includes(i))?.[0]}_${i.name}`]).length;
  const pct = allItems.length > 0 ? Math.round(doneCount / allItems.length * 100) : 0;

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:780, margin:'0 auto', padding:'32px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <Link to={`/trip/${tripId}/view`} style={{ fontSize:11, color:'#444', textDecoration:'none', letterSpacing:'0.2em', textTransform:'uppercase' }}>← Itinerary</Link>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', margin:'8px 0 4px' }}>
          🧳 Packing List
        </h1>
        <p style={{ fontSize:13, color:'#444' }}>{trip.name}</p>
      </div>

      {/* Progress */}
      <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:'18px 20px', marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:12, color:'#888' }}>{doneCount} of {allItems.length} packed</span>
          <span style={{ fontSize:16, fontWeight:800, color: pct===100?'#4caf50':'var(--sig)' }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:'#111', borderRadius:10 }}>
          <motion.div animate={{ width:`${pct}%` }} transition={{ duration:0.6 }}
            style={{ height:'100%', borderRadius:10, background: pct===100?'#4caf50':'var(--sig)' }} />
        </div>
        {pct === 100 && <p style={{ fontSize:13, color:'#4caf50', marginTop:10 }}>🎉 You're all packed!</p>}
      </div>

      {/* Add custom item */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <input placeholder="Add custom item…" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key==='Enter' && addItem()} style={{ ...inp, flex:1, minWidth:200 }} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ ...inp, width:'auto', flexShrink:0 }}>
          {[...CATEGORIES.map(c=>c.label),'AI Suggestions'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={addItem} style={btn({ background:'var(--sig)', color:'#000', padding:'10px 18px', fontSize:13 })}>Add</button>
        <button onClick={generateAIPacking} disabled={aiLoading} style={btn({ background:'#111', color:'#888', padding:'10px 18px', fontSize:13, border:'1px solid #1e1e1e', opacity:aiLoading?0.6:1 })}>
          {aiLoading ? 'Thinking…' : '✨ AI Suggestions'}
        </button>
      </div>

      {/* AI suggestions */}
      <AnimatePresence>
        {aiItems.length > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#0d0d0d', border:'1px solid var(--sig)', borderRadius:14, padding:18, marginBottom:24 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--sig)', marginBottom:12 }}>AI Suggestions for this trip</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {aiItems.map(item => (
                <button key={item} onClick={() => addAIItem(item)} style={btn({ padding:'7px 14px', fontSize:12, background:'#111', color:'#888', border:'1px solid #1e1e1e' })}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--sig)';e.currentTarget.style.color='#000';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#111';e.currentTarget.style.color='#888';}}>
                  + {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {Object.entries(items).map(([catLabel, catItems]) => {
          const catDone = catItems.filter(i => checked[i.id || `${catLabel}_${i.name}`]).length;
          const cat = CATEGORIES.find(c => c.label === catLabel);
          return (
            <div key={catLabel} style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #111', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{cat?.icon || '✨'}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'#e5e5e5' }}>{catLabel}</span>
                </div>
                <span style={{ fontSize:11, color:'#444' }}>{catDone}/{catItems.length}</span>
              </div>
              <div style={{ padding:'10px 14px', display:'flex', flexWrap:'wrap', gap:8 }}>
                {catItems.map((item, ii) => {
                  const key = item.id || `${catLabel}_${item.name}`;
                  const done = checked[key];
                  return (
                    <button key={ii} onClick={() => toggle(item.id, catLabel, item.name)}
                      style={btn({ padding:'7px 14px', fontSize:12, background: done?'#0d1a0d':'#0d0d0d', color: done?'#4caf50':'#666', border:`1px solid ${done?'#1a3a1a':'#1a1a1a'}`, textDecoration: done?'line-through':'none', transition:'all 0.15s' })}>
                      {done ? '✓ ' : ''}{item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
