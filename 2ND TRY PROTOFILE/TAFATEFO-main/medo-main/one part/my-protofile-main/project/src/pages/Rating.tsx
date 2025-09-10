import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Rating() {
  const [stars, setStars] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(localStorage.getItem('isAdmin') === '1');
  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('ratings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsLoggedIn(!!data.user);
    };
    syncAuth();
    const { data: sub } = supabase.auth.onAuthStateChange(() => syncAuth());
    const onAdmin = (e: any) => setIsAdmin(!!e?.detail?.isAdmin);
    window.addEventListener('admin:changed', onAdmin);
    return () => { mounted = false; sub.subscription.unsubscribe(); window.removeEventListener('admin:changed', onAdmin); };
  }, []);
  const Star = ({ index }: { index: number }) => {
    const active = (hover ?? stars) >= index;
    return (
      <button
        type="button"
        onMouseEnter={() => setHover(index)}
        onMouseLeave={() => setHover(null)}
        onClick={() => setStars(index)}
        aria-label={`Rate ${index} star`}
        className={"star-glow-wrap " + (active ? "active" : "")}
      >
        <svg className={(active ? "animate-breathe-gold " : "") + "star-3d"} width="34" height="34" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" style={{ margin: '2px' }}>
          <defs>
            <linearGradient id={`goldGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff1a8" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <filter id={`ds-${index}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={active ? '#f59e0b' : '#111827'} floodOpacity="0.6" />
            </filter>
          </defs>
          <g filter={`url(#ds-${index})`}>
            <path
              d="M32 8 L38 23 L54 24 L41 33 L46 49 L32 40 L18 49 L23 33 L10 24 L26 23 Z"
              fill={active ? `url(#goldGrad-${index})` : '#1f2937'}
              stroke={active ? '#fde68a' : '#374151'}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {active && (
              <path d="M32 8 L38 23 L54 24 L41 33 L46 49 L32 40 L18 49 L23 33 L10 24 L26 23 Z" fill="none" stroke="#fde68a" strokeOpacity="0.7" strokeWidth="0.8" />
            )}
            {active && (<circle cx="26" cy="20" r="6" fill="rgba(255,255,255,0.35)" />)}
          </g>
        </svg>
      </button>
    );
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Rating</h3>
        <form onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); const feedback = String(form.get('feedback')||''); if (stars < 1) { alert('Please select at least 1 star.'); return; } try { setSubmitting(true); const { data: sessionData } = await supabase.auth.getSession(); if (!sessionData.session?.user) { alert('Please login to submit a rating.'); return; } const user = sessionData.session.user; const meta: any = user.user_metadata || {}; const userName = meta.full_name || [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user.email || 'User'; const userAvatar = meta.avatar_url || meta.picture || null; let errorMsg = ''; { const payloadExt: any = { stars, feedback, user_name: userName, user_avatar_url: userAvatar }; const { error: errExt } = await supabase.from('ratings').insert(payloadExt); if (errExt) { errorMsg = String(errExt.message || ''); const looksLikeMissingColumn = /column|schema|not\s+found|not\s+exist/i.test(errorMsg) && /(user_name|user_avatar_url|created_by)/i.test(errorMsg); if (!looksLikeMissingColumn) throw errExt; const { error: errMin } = await supabase.from('ratings').insert({ stars, feedback }); if (errMin) throw errMin; } } const { data: refreshed } = await supabase.from('ratings').select('*').order('created_at', { ascending: false }); setItems(refreshed || []); alert('Thanks for your rating!'); (e.target as HTMLFormElement).reset(); setStars(0); setHover(null); } catch (err: any) { alert('Failed: '+(err?.message||String(err))); } finally { setSubmitting(false); } }} className="grid gap-4 max-w-2xl card-neon p-5">
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} index={i} />
            ))}
          </div>
          <textarea name="feedback" placeholder="Write your feedback" rows={4} className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30" />
          <button type="submit" disabled={!isLoggedIn || submitting || stars < 1} className="group relative px-6 py-3 rounded-full font-semibold w-max bg-gradient-to-r from-blue-400/20 to-blue-500/20 hover:from-green-400/20 hover:to-green-500/20 border-2 border-blue-400/50 hover:border-green-400/50 text-blue-300 hover:text-green-300 transition">
            <span className="btn-gleam btn-gleam-blue" aria-hidden="true" />
            <span className="btn-beam" aria-hidden="true" />
            <span className="relative z-10">{!isLoggedIn ? 'Login to submit' : submitting ? 'Submitting...' : 'Submit'}</span>
            <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 bg-gradient-to-r from-blue-400/50 to-blue-500/50 group-hover:from-green-400/50 group-hover:to-green-500/50" aria-hidden="true" />
          </button>
        </form>
        <div className="mt-10 max-w-3xl">
          <h4 className="text-2xl font-bold text-white mb-4">Recent ratings</h4>
          {loading && <p className="text-white/60">Loading...</p>}
          {!loading && items.length === 0 && <p className="text-white/60">No ratings yet.</p>}
          <div className="grid gap-4">
            {items.map((r) => {
              const name = r.user_name || 'User';
              const avatar = r.user_avatar_url || null;
              const initials = String(name).trim().split(/\s+/).slice(0,2).map((s: string) => s[0]?.toUpperCase()).join('') || 'U';
              return (
                <div key={r.id} className="card-neon p-4 flex gap-3 items-start">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full avatar-ring object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg_WHITE/10 border border-white/20 text-white/80 flex items-center justify-center text-sm font-bold avatar-ring">{initials}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold truncate">{name}</span>
                      <span className="text-yellow-400">{'★'.repeat(Math.max(1, Math.min(5, r.stars || 0)))}</span>
                    </div>
                    {r.feedback && <p className="text-white/80 text-sm mt-1 break-words">{r.feedback}</p>}
                    <p className="text-white/40 text-xs mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    {isAdmin && (
                      <div className="mt-3 flex gap-2">
                        <button onClick={async () => { const { data: sessionData } = await supabase.auth.getSession(); if (!sessionData.session?.user) { alert('Please login to edit ratings.'); return; } const newStarsStr = prompt('Edit stars (1-5)', String(r.stars || 5)); if (!newStarsStr) return; const newStars = Math.max(1, Math.min(5, parseInt(newStarsStr, 10) || 5)); const newFeedback = (prompt('Edit feedback', r.feedback || '') ?? r.feedback) || ''; try { const { error } = await supabase.from('ratings').update({ stars: newStars, feedback: newFeedback }).eq('id', r.id); if (error) return alert('Update failed: ' + error.message); setItems((arr) => arr.map((x) => x.id === r.id ? { ...x, stars: newStars, feedback: newFeedback } : x)); } catch (e: any) { alert('Failed: ' + (e?.message || String(e))); } }} className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-green-600 text-white text-sm">Edit</button>
                        <button onClick={async () => { const { data: sessionData } = await supabase.auth.getSession(); if (!sessionData.session?.user) { alert('Please login to delete ratings.'); return; } if (!confirm('Delete this rating?')) return; try { const { error } = await supabase.from('ratings').delete().eq('id', r.id); if (error) return alert('Delete failed: ' + error.message); setItems((arr) => arr.filter((x) => x.id !== r.id)); } catch (e: any) { alert('Failed: ' + (e?.message || String(e))); } }} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

