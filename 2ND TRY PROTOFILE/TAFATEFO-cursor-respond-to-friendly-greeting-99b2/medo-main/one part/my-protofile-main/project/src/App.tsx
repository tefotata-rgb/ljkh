import React from 'react';
import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import GradientText from './components/GradientText';
import NeonButton from './components/NeonButton';
import ProfileImage from './components/ProfileImage';
import TypingText from './components/TypingText';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import { supabase } from './lib/supabaseClient';
function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '6532') {
      onUnlock();
    } else {
      alert('Wrong admin code');
    }
  };
  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 max-w-sm p-4 rounded-xl neon-form">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter admin code" className="px-4 py-3 rounded-lg neon-input" />
      <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold w-max">Unlock</button>
    </form>
  );
}

function Home() {
  const handleContactEmail = () => {
    window.location.href = 'mailto:eleanoretefo1@gmail.com';
  };
  const handleWhatsApp = () => {
    window.open('https://wa.me/201227866673', '_blank');
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-12 pt-28 md:pt-32">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 text-left space-y-8">
          <div className="space-y-4">
            <GradientText className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <h1>Mohamed Atef</h1>
            </GradientText>
            <GradientText className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <h2>Abdelsattar</h2>
            </GradientText>
          </div>
          <GradientText className="text-lg md:text-2xl lg:text-3xl font-bold">
            <TypingText
              text="A Full Stack Developer and Web Solutions Expert with hands-on experience in building responsive websites, modern web applications, and delivering high-quality digital products tailored to client needs."
              speedMs={20}
            />
          </GradientText>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-start items-center pt-2">
            <NeonButton icon={Mail} onClick={handleContactEmail} variant="primary">
              Contact Me
            </NeonButton>
            <NeonButton icon={MessageCircle} onClick={handleWhatsApp} variant="secondary">
              WhatsApp
            </NeonButton>
          </div>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <ProfileImage />
        </div>
      </div>
    </div>
  );
}

function Works() {
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === '1');
  const [items, setItems] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('works').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    };
    load();
    const onAdmin = (e: any) => setIsAdmin(!!e?.detail?.isAdmin);
    window.addEventListener('admin:changed', onAdmin);
    return () => window.removeEventListener('admin:changed', onAdmin);
  }, []);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get('title') || '');
    const description = String(form.get('description') || '');
    const file = (form.get('image') as File | null) || null;
    try {
      setUploading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.user) {
        alert('Please login to upload.');
        return;
      }
      const userId = sessionData.session.user.id;
      let imageUrl: string | null = null;
      if (file && file.size > 0) {
        const path = `works/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('works').upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('works').getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }
      const { error: insErr } = await supabase.from('works').insert({ title, description, image_url: imageUrl, created_by: userId });
      if (insErr) throw insErr;
      alert('Work uploaded');
      (e.target as HTMLFormElement).reset();
      setImagePreview(null);
    } catch (err: any) {
      alert('Upload failed: ' + (err?.message || String(err)));
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Our Works</h3>
        {isAdmin && (
          <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl" encType="multipart/form-data">
            <input name="title" placeholder="Work Title" required className="px-4 py-3 rounded-lg neon-input" />
            <input name="description" placeholder="Short Description" className="px-4 py-3 rounded-lg neon-input" />
            <input name="image" type="file" accept="image/*" onChange={onFileChange} className="px-4 py-3 rounded-lg neon-input" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg border border-white/10" />}
            <button disabled={uploading} type="submit" className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold w-max">{uploading ? 'Uploading...' : 'Upload'}</button>
          </form>
        )}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingList && <p className="text-white/60">Loading...</p>}
          {!loadingList && items.length === 0 && <p className="text-white/60">No works yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              {it.image_url && <img loading="lazy" src={it.image_url} alt={it.title} className="w-full h-48 object-cover rounded-lg mb-3" />}
              <h4 className="text-white font-semibold">{it.title}</h4>
              {it.description && <p className="text-white/70 text-sm mt-1">{it.description}</p>}
              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <button onClick={async () => {
                    const newTitle = prompt('Edit title', it.title) || it.title;
                    const newDesc = prompt('Edit description', it.description || '') || it.description;
                    const { error } = await supabase.from('works').update({ title: newTitle, description: newDesc }).eq('id', it.id);
                    if (error) return alert('Update failed: ' + error.message);
                    setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, title: newTitle, description: newDesc } : x));
                  }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm">Edit</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this work?')) return;
                    const { error } = await supabase.from('works').delete().eq('id', it.id);
                    if (error) return alert('Delete failed: ' + error.message);
                    setItems((arr) => arr.filter((x) => x.id !== it.id));
                  }} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Skills() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">Skills</h3>
        <p className="text-white/70">Skills content coming soon.</p>
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">About</h3>
        <p className="text-white/70">About section coming soon.</p>
      </div>
    </div>
  );
}
function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      first_name: String(form.get('firstName') || ''),
      middle_name: String(form.get('middleName') || ''),
      last_name: String(form.get('lastName') || ''),
      phone: String(form.get('phone') || ''),
      message: String(form.get('message') || ''),
    };
    try {
      setSubmitting(true);
      const { error } = await supabase.from('contact_messages').insert(payload);
      if (error) throw error;
      alert('Message sent!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert('Failed to send: ' + (err?.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Contact</h3>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 max-w-2xl p-6 rounded-2xl neon-form">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="firstName" placeholder="First Name" required className="px-4 py-3 rounded-lg neon-input" />
            <input name="middleName" placeholder="Middle Name" className="px-4 py-3 rounded-lg neon-input" />
            <input name="lastName" placeholder="Last Name" required className="px-4 py-3 rounded-lg neon-input" />
          </div>
          <input name="phone" type="tel" placeholder="Phone Number" required className="px-4 py-3 rounded-lg neon-input" />
          <textarea name="message" placeholder="Your Message" rows={5} required className="px-4 py-3 rounded-lg neon-input" />
          <button disabled={submitting} type="submit" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold w-max">{submitting ? 'Sending...' : 'Send'}</button>
        </form>
      </div>
    </div>
  );
}

function Certification() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === '1');
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    };
    load();
    const onAdmin = (e: any) => setIsAdmin(!!e?.detail?.isAdmin);
    window.addEventListener('admin:changed', onAdmin);
    return () => window.removeEventListener('admin:changed', onAdmin);
  }, []);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('certificateName') || '');
    const info = String(form.get('certificateInfo') || '');
    const file = (form.get('certificateImage') as File | null) || null;
    try {
      setUploading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.user) {
        alert('Please login to upload.');
        return;
      }
      const userId = sessionData.session.user.id;
      let imageUrl: string | null = null;
      if (file && file.size > 0) {
        const path = `certifications/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('certifications').upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('certifications').getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }
      const { error: insErr } = await supabase.from('certifications').insert({ name, info, image_url: imageUrl, created_by: userId });
      if (insErr) throw insErr;
      alert('Certification uploaded');
      (e.target as HTMLFormElement).reset();
      setImagePreview(null);
    } catch (err: any) {
      alert('Upload failed: ' + (err?.message || String(err)));
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Certification</h3>
        {isAdmin && (
          <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl" encType="multipart/form-data">
            <input name="certificateName" placeholder="Certificate Name" required className="px-4 py-3 rounded-lg neon-input" />
            <input name="certificateInfo" placeholder="Certificate Info" className="px-4 py-3 rounded-lg neon-input" />
            <input name="certificateImage" type="file" accept="image/*" onChange={onFileChange} className="px-4 py-3 rounded-lg neon-input" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg border border-white/10" />
            )}
            <button disabled={uploading} type="submit" className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold w-max">{uploading ? 'Uploading...' : 'Upload'}</button>
          </form>
        )}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingList && <p className="text-white/60">Loading...</p>}
          {!loadingList && items.length === 0 && <p className="text-white/60">No certifications yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              {it.image_url && <img loading="lazy" src={it.image_url} alt={it.name} className="w-full h-48 object-cover rounded-lg mb-3" />}
              <h4 className="text-white font-semibold">{it.name}</h4>
              {it.info && <p className="text-white/70 text-sm mt-1">{it.info}</p>}
              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <button onClick={async () => {
                    const newName = prompt('Edit name', it.name) || it.name;
                    const newInfo = prompt('Edit info', it.info || '') || it.info;
                    const { error } = await supabase.from('certifications').update({ name: newName, info: newInfo }).eq('id', it.id);
                    if (error) return alert('Update failed: ' + error.message);
                    setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, name: newName, info: newInfo } : x));
                  }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm">Edit</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this certification?')) return;
                    const { error } = await supabase.from('certifications').delete().eq('id', it.id);
                    if (error) return alert('Delete failed: ' + error.message);
                    setItems((arr) => arr.filter((x) => x.id !== it.id));
                  }} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Rating() {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const Star = ({ index }: { index: number }) => {
    const active = (hover ?? stars) >= index;
    return (
      <button
        type="button"
        onMouseEnter={() => setHover(index)}
        onMouseLeave={() => setHover(null)}
        onClick={() => setStars(index)}
        aria-label={`Rate ${index} star`}
        className={"transition transform " + (active ? "glow-strong-yellow" : "")}
      >
        <svg className={(active ? "animate-spin-fast " : "") + "star-3d"} width="48" height="48" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
          <defs>
            <radialGradient id="starSpecularGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fff59d"/>
              <stop offset="60%" stop-color="#fde68a" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#facc15" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <g style={{ transform: 'translateZ(30px)' }}>
            <polygon className="star-face" points="32,4 40,24 62,24 44,36 50,56 32,44 14,56 20,36 2,24 24,24" />
            <circle className="star-specular" cx="26" cy="20" r="10" />
          </g>
        </svg>
      </button>
    );
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Rating</h3>
        <form onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); const feedback = String(form.get('feedback')||''); try { const { error } = await supabase.from('ratings').insert({ stars, feedback }); if (error) throw error; alert('Thanks for your rating!'); (e.target as HTMLFormElement).reset(); setStars(0); setHover(null); } catch (err: any) { alert('Failed: '+(err?.message||String(err))); } }} className="grid gap-4 max-w-2xl">
          <div className="orbit">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="orbit-item orbit-spin" style={{ transform: `rotate(${(i-1)*72}deg)` }}>
                <Star index={i} />
              </div>
            ))}
          </div>
          <textarea name="feedback" placeholder="Write your feedback" rows={4} className="px-4 py-3 rounded-lg neon-input" />
          <button type="submit" className="px-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-semibold w-max">Submit</button>
        </form>
      </div>
    </div>
  );
}

function Talk() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'assistant'; content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-10) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'No response' }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error reaching assistant.' }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Talk</h3>
        <div className="grid gap-4 max-w-2xl">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 max-h-96 overflow-auto">
            {messages.length === 0 && <p className="text-white/60">Say hi to start the conversation.</p>}
            {messages.map((m, i) => (
              <div key={i} className={"mb-2 " + (m.role === 'user' ? 'text-blue-300' : 'text-green-300')}>
                <span className="font-semibold">{m.role === 'user' ? 'You' : 'AI'}:</span> {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40" />
            <button disabled={loading} onClick={send} className="px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-semibold">{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Logged in');
      } else {
        const firstName = String(form.get('firstName') || '');
        const lastName = String(form.get('lastName') || '');
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } });
        if (error) throw error;
        alert('Signed up! Please check your email to confirm.');
      }
    } catch (err: any) {
      alert('Auth failed: ' + (err?.message || String(err)));
    }
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-6">Login</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 rounded-2xl neon-form">
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setMode('login')} className={"px-3 py-2 rounded-lg text-sm font-semibold " + (mode==='login' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80')}>Login</button>
              <button type="button" onClick={() => setMode('signup')} className={"px-3 py-2 rounded-lg text-sm font-semibold " + (mode==='signup' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80')}>Sign Up</button>
            </div>
            {mode==='signup' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="firstName" placeholder="First Name" className="px-4 py-3 rounded-lg neon-input" />
                  <input name="lastName" placeholder="Last Name" className="px-4 py-3 rounded-lg neon-input" />
                </div>
                <input name="email" type="email" placeholder="Email" required className="px-4 py-3 rounded-lg neon-input" />
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create Password" required className="px-4 py-3 rounded-lg neon-input w-full" />
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" required className="px-4 py-3 rounded-lg neon-input w-full" />
              </>
            )}
            {mode==='login' && (
              <>
                <input name="email" type="email" placeholder="Email" required className="px-4 py-3 rounded-lg neon-input" />
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" required className="px-4 py-3 rounded-lg neon-input w-full" />
              </>
            )}
            <label className="text-white/70 text-sm mt-1 inline-flex items-center gap-2">
              <input type="checkbox" onChange={(e) => setShowPassword(e.target.checked)} /> Show password
            </label>
            <button type="submit" className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold w-max">{mode==='login' ? 'Login' : 'Sign Up'}</button>
          </form>
          <div className="p-6 rounded-2xl neon-form grid content-center">
            <button onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); }} className="px-6 py-3 rounded-lg bg-white text-gray-800 font-semibold w-full flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.825,6.053,29.192,4,24,4C12.955,4,4,12.955,4,24  c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C33.825,6.053,29.192,4,24,4C16.318,4,9.5,8.469,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36  c-5.202,0-9.619-3.317-11.283-7.943l-6.522,5.025C9.5,39.531,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0..94,9.63-2.06,2.23,9.1,0,3.059,0,5.842,1.154,7.961,3.039l5.657-5.657z"/></svg>
              Continue with Google
            </button>
            <p className="text-white/50 text-sm mt-3 text-center">Google auth button (placeholder). Integrate real OAuth later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadingComplete = () => setIsLoading(false);
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <Navbar />
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/about" element={<About />} />
        <Route path="/certification" element={<Certification />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/talk" element={<Talk />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;