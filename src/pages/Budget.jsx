import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';
import { CITIES, estimateDailyCost } from '../lib/cityData';

/* ── Recharts loaded dynamically to avoid bundle bloat ── */
let RC = null;

const CATS = ['accommodation', 'food', 'transport', 'activities', 'shopping', 'misc'];
const CAT_COLORS = { accommodation:'#ff6b00', food:'#ff9a3c', transport:'#ffc270', activities:'#ff4500', shopping:'#cc3700', misc:'#662000' };
const CAT_ICONS  = { accommodation:'🏨', food:'🍜', transport:'✈️', activities:'🎟️', shopping:'🛍️', misc:'💸' };

const inp = { background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, color:'#e5e5e5', fontFamily:'Outfit,sans-serif', fontSize:13, padding:'10px 13px', outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s' };
const btn = (x={}) => ({ fontFamily:'Outfit,sans-serif', fontWeight:700, cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s', ...x });

export default function Budget() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExp, setNewExp] = useState({ label:'', amount:'', category:'food', date:'' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [rcReady, setRcReady] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  /* Load trip + expenses */
  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => {
      if (data) { setTrip(data); if (data.budget) setBudget(String(data.budget)); }
    });
    supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at').then(({ data }) => data && setExpenses(data));
  }, [tripId]);

  /* Load Recharts */
  useEffect(() => {
    if (window.Recharts) { RC = window.Recharts; setRcReady(true); return; }
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.js';
    sc.onload = () => { RC = window.Recharts; setRcReady(true); };
    document.body.appendChild(sc);
  }, []);

  const total     = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = budget ? Number(budget) - total : null;

  /* Category breakdown for pie */
  const catData = CATS.map(c => ({
    name: c, value: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0), color: CAT_COLORS[c],
  })).filter(d => d.value > 0);

  /* Daily spending for line chart */
  const dailyMap = {};
  expenses.forEach(e => { const d = e.date || 'unknown'; dailyMap[d] = (dailyMap[d] || 0) + Number(e.amount); });
  const dailyData = Object.entries(dailyMap).sort(([a],[b]) => new Date(a) - new Date(b)).map(([date, amount]) => ({ date: date === 'unknown' ? '?' : new Date(date+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}), amount }));

  const addExpense = async () => {
    if (!newExp.label || !newExp.amount) return;
    setSaving(true);
    const { data } = await supabase.from('expenses').insert({ ...newExp, amount: Number(newExp.amount), trip_id: tripId }).select().single();
    if (data) setExpenses(p => [...p, data]);
    setNewExp({ label:'', amount:'', category:'food', date:'' });
    setAdding(false);
    setSaving(false);
  };

  const delExpense = async id => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(p => p.filter(e => e.id !== id));
  };

  const saveBudget = async () => {
    await supabase.from('trips').update({ budget: Number(budget) }).eq('id', tripId);
  };

  const getAiAdvice = async () => {
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a travel finance advisor. Be concise, practical, and personalized. Use bullet points.`;
    const prompt = `Trip: "${trip.name}". Budget: $${budget || 'not set'}. Total spent: $${total.toFixed(2)}. 
Breakdown: ${CATS.map(c => `${c}: $${expenses.filter(e=>e.category===c).reduce((s,e)=>s+Number(e.amount),0).toFixed(2)}`).join(', ')}.
Give 4-5 practical tips to manage this travel budget better.`;
    const ans = await askGemini(sys, prompt);
    setAiAdvice(ans);
    setAiLoading(false);
  };

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:860, margin:'0 auto', padding:'32px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <Link to={`/trip/${tripId}/view`} style={{ fontSize:11, color:'#444', textDecoration:'none', letterSpacing:'0.2em', textTransform:'uppercase' }}>← Itinerary</Link>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', margin:'8px 0 4px' }}>
          {trip.mood_emoji || '💰'} Budget Tracker
        </h1>
        <p style={{ fontSize:13, color:'#444' }}>{trip.name}</p>
      </div>

      {/* Budget input + stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { label:'Total Budget', value: budget ? `$${Number(budget).toLocaleString()}` : '—', sub:'Set below', color:'#fff' },
          { label:'Total Spent',  value: `$${total.toFixed(2)}`, sub:`${expenses.length} expenses`, color:'var(--sig)' },
          { label:'Remaining',    value: remaining !== null ? `$${remaining.toFixed(2)}` : '—', sub: remaining < 0 ? '⚠ Over budget' : 'left to spend', color: remaining < 0 ? '#ff4444' : '#4caf50' },
          { label:'Daily Avg',    value: dailyData.length ? `$${(total/dailyData.length).toFixed(0)}` : '—', sub:'per day', color:'#888' },
        ].map(c => (
          <div key={c.label} style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:'18px 20px' }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#444', marginBottom:8 }}>{c.label}</p>
            <p style={{ fontFamily:'"Playfair Display",serif', fontSize:26, fontWeight:700, color:c.color, lineHeight:1 }}>{c.value}</p>
            <p style={{ fontSize:11, color:'#444', marginTop:6 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Set budget row */}
      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        <input placeholder="Set total budget (e.g. 2500)" value={budget} onChange={e => setBudget(e.target.value)} type="number" style={{ ...inp, maxWidth:280 }} />
        <button onClick={saveBudget} style={btn({ background:'var(--sig)', color:'#000', padding:'10px 20px', fontSize:13 })}>Save Budget</button>
        <button onClick={() => setAdding(true)} style={btn({ background:'#111', color:'#888', padding:'10px 20px', fontSize:13, border:'1px solid #1e1e1e' })}>+ Add Expense</button>
      </div>

      {/* Add expense form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:14, padding:18, marginBottom:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <input placeholder="Description *" value={newExp.label} onChange={e => setNewExp(p=>({...p,label:e.target.value}))} style={inp} />
              <input placeholder="Amount (USD) *" type="number" value={newExp.amount} onChange={e => setNewExp(p=>({...p,amount:e.target.value}))} style={inp} />
              <input type="date" value={newExp.date} onChange={e => setNewExp(p=>({...p,date:e.target.value}))} style={inp} />
              <select value={newExp.category} onChange={e => setNewExp(p=>({...p,category:e.target.value}))} style={{ ...inp }}>
                {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={addExpense} disabled={saving||!newExp.label||!newExp.amount} style={btn({ background:'var(--sig)', color:'#000', padding:'9px 20px', fontSize:13, opacity:saving?0.6:1 })}>{saving?'Saving…':'Add'}</button>
              <button onClick={() => setAdding(false)} style={btn({ background:'#111', color:'#666', padding:'9px 16px', fontSize:13 })}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {['overview','list','ai'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={btn({ padding:'8px 18px', fontSize:12, textTransform:'capitalize', background:activeTab===t?'var(--sig)':'#0d0d0d', color:activeTab===t?'#000':'#555', border:`1px solid ${activeTab===t?'var(--sig)':'#1a1a1a'}` })}>{t==='ai'?'🤖 AI Advice':t==='overview'?'📊 Charts':'📋 Expenses'}</button>
        ))}
      </div>

      {/* OVERVIEW: Charts */}
      {activeTab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Pie */}
          <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:20 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#444', marginBottom:16 }}>By Category</p>
            {rcReady && catData.length > 0 ? (
              <RC.ResponsiveContainer width="100%" height={220}>
                <RC.PieChart>
                  <RC.Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                    {catData.map((c, i) => <RC.Cell key={i} fill={c.color} />)}
                  </RC.Pie>
                  <RC.Tooltip formatter={v => `$${v.toFixed(2)}`} contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontFamily:'Outfit,sans-serif' }} />
                  <RC.Legend iconType="circle" wrapperStyle={{ fontSize:11, fontFamily:'Outfit,sans-serif', color:'#666' }} />
                </RC.PieChart>
              </RC.ResponsiveContainer>
            ) : (
              <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:13 }}>{catData.length===0?'No expenses yet':' Loading charts…'}</div>
            )}
          </div>

          {/* Bar */}
          <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:20 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#444', marginBottom:16 }}>Daily Spending</p>
            {rcReady && dailyData.length > 0 ? (
              <RC.ResponsiveContainer width="100%" height={220}>
                <RC.BarChart data={dailyData} barSize={20}>
                  <RC.XAxis dataKey="date" tick={{ fontSize:10, fill:'#444' }} axisLine={false} tickLine={false} />
                  <RC.YAxis tick={{ fontSize:10, fill:'#444' }} axisLine={false} tickLine={false} />
                  <RC.Tooltip formatter={v => `$${v.toFixed(2)}`} contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontFamily:'Outfit,sans-serif' }} />
                  <RC.Bar dataKey="amount" fill="hsl(22,92%,52%)" radius={[4,4,0,0]} />
                </RC.BarChart>
              </RC.ResponsiveContainer>
            ) : (
              <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:13 }}>{dailyData.length===0?'Add expenses with dates':'Loading…'}</div>
            )}
          </div>

          {/* Category bars */}
          <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:20, gridColumn:'span 2' }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#444', marginBottom:16 }}>Breakdown</p>
            {CATS.map(c => {
              const amt = expenses.filter(e=>e.category===c).reduce((s,e)=>s+Number(e.amount),0);
              const pct = total > 0 ? (amt/total*100) : 0;
              return (
                <div key={c} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#888' }}>{CAT_ICONS[c]} {c}</span>
                    <span style={{ fontSize:12, color:'#555' }}>${amt.toFixed(2)} · {pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:5, background:'#111', borderRadius:10 }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:'easeOut' }}
                      style={{ height:'100%', borderRadius:10, background:CAT_COLORS[c] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST */}
      {activeTab === 'list' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {expenses.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#333' }}><p style={{ fontSize:24 }}>💸</p><p style={{ marginTop:8 }}>No expenses yet. Add one above!</p></div>
          ) : expenses.map(e => (
            <motion.div key={e.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:20 }}>{CAT_ICONS[e.category]||'💸'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#e5e5e5' }}>{e.label}</div>
                <div style={{ fontSize:11, color:'#444', marginTop:2 }}>{e.category}{e.date ? ` · ${new Date(e.date+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}` : ''}</div>
              </div>
              <span style={{ fontWeight:700, fontSize:15, color:'var(--sig)' }}>${Number(e.amount).toFixed(2)}</span>
              <button onClick={() => delExpense(e.id)} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', fontSize:16 }}
                onMouseEnter={e=>e.currentTarget.style.color='#ff4444'} onMouseLeave={e=>e.currentTarget.style.color='#333'}>×</button>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI */}
      {activeTab === 'ai' && (
        <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:24 }}>
          <p style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', fontSize:18, color:'#fff', marginBottom:16 }}>AI Budget Advisor</p>
          {!aiAdvice && !aiLoading && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <p style={{ fontSize:13, color:'#444', marginBottom:20 }}>Get personalized advice based on your spending</p>
              <button onClick={getAiAdvice} style={btn({ background:'var(--sig)', color:'#000', padding:'12px 28px', fontSize:14 })}>Generate Advice</button>
            </div>
          )}
          {aiLoading && <p style={{ color:'#555', fontStyle:'italic' }}>Analyzing your budget…</p>}
          {aiAdvice && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ fontSize:13, color:'#888', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{aiAdvice}</div>
              <button onClick={getAiAdvice} disabled={aiLoading} style={{ ...btn({ background:'#111', color:'#666', padding:'9px 18px', fontSize:12, marginTop:16, border:'1px solid #1e1e1e' }), opacity:aiLoading?0.5:1 }}>
                Refresh Advice
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
