import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';

const inp = { background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, color:'#e5e5e5', fontFamily:'Outfit,sans-serif', fontSize:13, padding:'10px 13px', outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s' };
const btn = (x={}) => ({ fontFamily:'Outfit,sans-serif', fontWeight:700, cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s', ...x });

const PROMPTS = [
  'What was the most memorable moment today?',
  'Describe a local you met.',
  'What surprised you about this place?',
  'Best food you tried today?',
  'One thing you\'d do differently?',
];

export default function Notes() {
  const { tripId } = useParams();
  const [trip,   setTrip]   = useState(null);
  const [notes,  setNotes]  = useState([]);
  const [draft,  setDraft]  = useState('');
  const [title,  setTitle]  = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const textRef = useRef();

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => data && setTrip(data));
    supabase.from('trip_notes').select('*').eq('trip_id', tripId).order('created_at', { ascending:false }).then(({ data }) => data && setNotes(data));
  }, [tripId]);

  const saveNote = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase.from('trip_notes').update({ title, content:draft }).eq('id', editing).select().single();
      if (data) setNotes(p => p.map(n => n.id === editing ? data : n));
      setEditing(null);
    } else {
      const { data } = await supabase.from('trip_notes').insert({ trip_id:tripId, title: title || 'Note', content:draft }).select().single();
      if (data) setNotes(p => [data, ...p]);
    }
    setDraft(''); setTitle(''); setSaving(false);
  };

  const del = async id => {
    await supabase.from('trip_notes').delete().eq('id', id);
    setNotes(p => p.filter(n => n.id !== id));
  };

  const editNote = n => {
    setEditing(n.id); setDraft(n.content); setTitle(n.title || '');
    setTimeout(() => textRef.current?.focus(), 100);
  };

  const expandWithAI = async () => {
    if (!draft.trim()) return;
    setAiLoading(true);
    const sys = `You are a creative travel journal assistant. Help expand travel journal entries poetically.`;
    const ans = await askGemini(sys, `Expand and enrich this travel journal entry for the trip "${trip?.name}": "${draft}". Keep it authentic, vivid, and under 150 words.`);
    setDraft(prev => prev + '\n\n' + ans);
    setAiLoading(false);
  };

  const usePrompt = async p => {
    setAiPrompt(p); setShowPrompt(false);
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a poetic travel journal writer. Write in first person, vivid and personal.`;
    const starter = await askGemini(sys, `Write a 3-sentence travel journal entry for the trip "${trip?.name}" starting with the prompt: "${p}"`);
    setDraft(prev => prev ? prev + '\n\n' + starter : starter);
    setAiLoading(false);
    textRef.current?.focus();
  };

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:820, margin:'0 auto', padding:'32px 20px 80px' }}>

      <div style={{ marginBottom:24 }}>
        <Link to={`/trip/${tripId}/view`} style={{ fontSize:11, color:'#444', textDecoration:'none', letterSpacing:'0.2em', textTransform:'uppercase' }}>← Itinerary</Link>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', margin:'8px 0 4px' }}>
          📓 Travel Journal
        </h1>
        <p style={{ fontSize:13, color:'#444' }}>{trip.name}</p>
      </div>

      {/* Editor */}
      <div style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:16, padding:22, marginBottom:24 }}>
        <input placeholder="Note title (optional)" value={title} onChange={e => setTitle(e.target.value)}
          style={{ ...inp, marginBottom:10, background:'transparent', border:'none', borderBottom:'1px solid #1a1a1a', borderRadius:0, fontSize:16, fontWeight:700, color:'#e5e5e5', paddingLeft:0 }} />

        <textarea ref={textRef} placeholder="Write your travel story here…" value={draft} onChange={e => setDraft(e.target.value)}
          rows={6} style={{ ...inp, resize:'vertical', background:'transparent', border:'none', fontSize:14, lineHeight:1.8, paddingLeft:0, marginBottom:14 }} />

        {/* AI tools */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, paddingTop:10, borderTop:'1px solid #111' }}>
          <button onClick={() => setShowPrompt(p=>!p)} style={btn({ padding:'7px 14px', fontSize:12, background:'#111', color:'#666', border:'1px solid #1e1e1e' })}>
            💡 Journal Prompts
          </button>
          <button onClick={expandWithAI} disabled={aiLoading || !draft.trim()} style={btn({ padding:'7px 14px', fontSize:12, background:'#111', color:'#666', border:'1px solid #1e1e1e', opacity:aiLoading||!draft.trim()?0.5:1 })}>
            {aiLoading ? '✨ Writing…' : '✨ Expand with AI'}
          </button>
        </div>

        <AnimatePresence>
          {showPrompt && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              style={{ marginBottom:14, display:'flex', flexWrap:'wrap', gap:8 }}>
              {PROMPTS.map(p => (
                <button key={p} onClick={() => usePrompt(p)} style={btn({ padding:'8px 14px', fontSize:12, background:'#0d0d0d', color:'#888', border:'1px solid #1e1e1e', textAlign:'left' })}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--sig)';e.currentTarget.style.color='#ccc';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e1e1e';e.currentTarget.style.color='#888';}}>
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          {editing && (
            <button onClick={() => { setEditing(null); setDraft(''); setTitle(''); }} style={btn({ padding:'9px 18px', fontSize:13, background:'#111', color:'#666' })}>Cancel</button>
          )}
          <button onClick={saveNote} disabled={saving || !draft.trim()} style={btn({ background:'var(--sig)', color:'#000', padding:'9px 22px', fontSize:13, opacity:saving||!draft.trim()?0.5:1 })}>
            {saving ? 'Saving…' : editing ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* Saved notes */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {notes.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#333' }}>
            <p style={{ fontSize:28 }}>📝</p>
            <p style={{ marginTop:8, fontSize:13 }}>Start writing your travel story above.</p>
          </div>
        )}
        {notes.map(n => (
          <motion.div key={n.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <h3 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:18, color:'#fff', margin:0 }}>{n.title || 'Note'}</h3>
                <p style={{ fontSize:11, color:'#444', marginTop:3 }}>
                  {new Date(n.created_at).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}
                </p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => editNote(n)} style={btn({ padding:'6px 12px', fontSize:11, background:'#111', color:'#666', border:'1px solid #1e1e1e' })}>Edit</button>
                <button onClick={() => del(n.id)} style={btn({ padding:'6px 12px', fontSize:11, background:'none', color:'#333', border:'1px solid #1e1e1e' })}
                  onMouseEnter={e=>{e.currentTarget.style.color='#ff4444';e.currentTarget.style.borderColor='#ff4444';}}
                  onMouseLeave={e=>{e.currentTarget.style.color='#333';e.currentTarget.style.borderColor='#1e1e1e';}}>Del</button>
              </div>
            </div>
            <p style={{ fontSize:13, color:'#666', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{n.content}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
