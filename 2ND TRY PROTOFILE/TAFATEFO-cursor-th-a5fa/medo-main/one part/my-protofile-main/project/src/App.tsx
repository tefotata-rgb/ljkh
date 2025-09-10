import React from 'react';
import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Mail, MessageCircle, Facebook, Linkedin, Phone } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import GradientText from './components/GradientText';
import NeonButton from './components/NeonButton';
import ProfileImage from './components/ProfileImage';
import TypingText from './components/TypingText';
import LoadingScreen from './components/LoadingScreen';
import NotFound from './components/NotFound';
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
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
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsLoggedIn(!!data.user);
    };
    syncAuth();
    const { data: sub } = supabase.auth.onAuthStateChange(() => syncAuth());
    return () => {
      window.removeEventListener('admin:changed', onAdmin);
      mounted = false;
      sub.subscription.unsubscribe();
    };
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
        {(isAdmin || isLoggedIn) && (
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
              {(isAdmin || isLoggedIn) && (
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
  const skills: { name: string; icon?: string }[] = [
    { name: 'HTML', icon: 'devicon-html5-plain' },
    { name: 'CSS', icon: 'devicon-css3-plain' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain' },
    { name: 'Python', icon: 'devicon-python-plain' },
    { name: 'Java', icon: 'devicon-java-plain' },
    { name: 'C', icon: 'devicon-c-plain' },
    { name: 'C++', icon: 'devicon-cplusplus-plain' },
    { name: 'C#', icon: 'devicon-csharp-plain' },
    { name: 'PHP', icon: 'devicon-php-plain' },
    { name: 'Ruby', icon: 'devicon-ruby-plain' },
    { name: 'Swift', icon: 'devicon-swift-plain' },
    { name: 'Kotlin', icon: 'devicon-kotlin-plain' },
    { name: 'Go', icon: 'devicon-go-plain' },
    { name: 'Rust', icon: 'devicon-rust-plain' },
    { name: 'R', icon: 'devicon-r-plain' },
    { name: 'Dart', icon: 'devicon-dart-plain' },
    { name: 'SQL', icon: 'devicon-mysql-plain' },
    { name: 'Scala', icon: 'devicon-scala-plain' },
    { name: 'MATLAB', icon: 'devicon-matlab-plain' },
  ];
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" style={{background:
        'radial-gradient(900px 540px at 10% 0%, rgba(59,130,246,0.12), rgba(0,0,0,0)),'+
        'radial-gradient(600px 400px at 90% 100%, rgba(236,72,153,0.10), rgba(0,0,0,0)),'+
        'radial-gradient(700px 420px at 50% 50%, rgba(16,185,129,0.08), rgba(0,0,0,0))'}} />
      <div className="mx-auto max-w-7xl relative">
        <div className="mb-10">
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neon-strong-blue">Skills</h3>
          <p className="mt-3 text-white/90 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium text-neon-strong-blue">
            Passionate full‑stack developer crafting performant, delightful user experiences and reliable backends.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
          {skills.map((s) => (
            <div key={s.name} className="tilt-wrap">
              <div className="relative flex flex-col items-center justify-center text-center tilt-card">
                <div className="shine-wrap relative h-16 w-16 md:h-20 md:w-20 rounded-full circle-neon flex items-center justify-center">
                  <div className="shine" aria-hidden="true" />
                  {s.icon ? (
                    <i className={`${s.icon} colored text-3xl md:text-4xl icon-neon`} aria-hidden="true" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                  )}
                </div>
                <span className="mt-2 text-xs md:text-sm font-semibold text-neon-blue">{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-5xl space-y-10">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-pink-400 to-blue-500 bg-clip-text text-transparent">About Me</h3>

        {/* Block 1: Image 1 + Text */}
        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-green-400/30 via-pink-400/30 to-blue-500/30" aria-hidden="true" />
          <div className="relative w-full h-[340px] md:h-[420px] bg-black/30 flex items-center justify-center">
            <img src="/1.jpg" alt="Mohamed Atef portrait" className="max-h-full w-auto object-contain" />
          </div>
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              Hello! My name is Mohamed Atef, and I am a dedicated software developer with a strong passion for building creative digital solutions. From the very first time I wrote a line of code, I knew that programming was not just a career choice for me, but a lifelong journey of learning, problem-solving, and innovation. Over the years, I’ve developed a deep interest in designing systems that are both efficient and user-friendly. My goal is always to turn ideas into reality through technology, and to create projects that have a real impact.
            </p>
          </div>
        </div>

        {/* Block 2: Image 6 + Text */}
        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-blue-400/30 via-pink-400/30 to-green-500/30" aria-hidden="true" />
          <img src="/6.jpg" alt="Nile University highlight" className="w-full max-h-[480px] object-cover" />
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              I am proud to be a graduate of Nile University, an institution that has played a key role in shaping my academic and professional journey. My years at the university provided me with a strong technical foundation, critical thinking skills, and exposure to real-world projects that challenged me to think outside the box. At Nile University, I not only studied the theoretical aspects of computer science but also applied my knowledge through hands-on experiences, teamwork, and research opportunities. It was here that I learned the value of persistence, collaboration, and innovation in the field of technology.
            </p>
          </div>
        </div>

        {/* Block 3: Image 2 + Text + Socials */}
        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-pink-400/30 via-blue-400/30 to-green-500/30" aria-hidden="true" />
          <div className="relative w-full h-[340px] md:h-[420px] bg-black/30 flex items-center justify-center">
            <img src="/2.jpg" alt="Collaboration and connection" className="max-h-full w-auto object-contain" />
          </div>
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              Thank you for visiting my page and taking the time to get to know more about me. I am always open to new opportunities, collaborations, and meaningful conversations in the world of technology and beyond. If you would like to work together, discuss ideas, or simply connect, please feel free to reach out. I believe that great things happen when people share knowledge and collaborate on building something bigger than themselves. Let’s create something impactful together!
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://www.facebook.com/share/1Cku3ivj8f/"
                target="_blank"
                rel="noreferrer"
                className="group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-blue-400/20 to-blue-500/20 border-2 border-blue-400/50 text-blue-300"
              >
                <span className="btn-gleam btn-gleam-blue" aria-hidden="true" />
                <span className="btn-beam" aria-hidden="true" />
                <Facebook size={16} />
                <span className="relative z-10">Facebook</span>
                <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-blue-400/50 to-blue-500/50" aria-hidden="true" />
              </a>

              <a
                href="https://wa.me/201227866673"
                target="_blank"
                rel="noreferrer"
                className="group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-green-400/20 to-green-500/20 border-2 border-green-400/50 text-green-300"
              >
                <span className="btn-gleam btn-gleam-green" aria-hidden="true" />
                <span className="btn-beam" aria-hidden="true" />
                <Phone size={16} />
                <span className="relative z-10">WhatsApp</span>
                <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-green-400/50 to-green-500/50" aria-hidden="true" />
              </a>

              <a
                href="https://www.linkedin.com/in/mohamed-atef-5b1a82351?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noreferrer"
                className="group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-blue-400/20 to-blue-500/20 border-2 border-blue-400/50 text-blue-300"
              >
                <span className="btn-gleam btn-gleam-blue" aria-hidden="true" />
                <span className="btn-beam" aria-hidden="true" />
                <Linkedin size={16} />
                <span className="relative z-10">LinkedIn</span>
                <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-blue-400/50 to-blue-500/50" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
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
      // Open Gmail compose (fallback to mailto) with prefilled content
      const to = 'eleanoretftf301@gmail.com';
      const fullName = [payload.first_name, payload.middle_name, payload.last_name].filter(Boolean).join(' ').trim() || 'Visitor';
      const subject = `New contact message from ${fullName}`;
      const body = `Name: ${fullName}\nPhone: ${payload.phone || 'N/A'}\n\nMessage:\n${payload.message || ''}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const win = window.open(gmailUrl, '_blank');
      if (!win) {
        window.location.href = mailtoUrl;
      }
      alert('Opening your email app to send...');
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
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
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsLoggedIn(!!data.user);
    };
    syncAuth();
    const { data: sub } = supabase.auth.onAuthStateChange(() => syncAuth());
    return () => {
      window.removeEventListener('admin:changed', onAdmin);
      mounted = false;
      sub.subscription.unsubscribe();
    };
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
        {(isAdmin || isLoggedIn) && (
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
              {(isAdmin || isLoggedIn) && (
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === '1');
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
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white/80 flex items-center justify-center text-sm font-bold avatar-ring">{initials}</div>
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
        <div className="grid gap-8">
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

            <div className="relative my-2">
              <div className="h-px bg-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 text-xs text-white/50 bg-gray-900">OR</span>
              </div>
            </div>
            <button type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); }} className="px-6 py-3 rounded-lg bg-white text-gray-800 font-semibold w-full flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.825,6.053,29.192,4,24,4C16.318,4,9.5,8.469,6.306,14.691z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C33.825,6.053,29.192,4,24,4C16.318,4,9.5,8.469,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36  c-5.202,0-9.619-3.317-11.283-7.943l-6.522,5.025C9.5,39.531,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0..94,9.63-2.06,2.23,9.1,0,3.059,0,5.842,1.154,7.961,3.039l5.657-5.657z"/></svg>
              Continue with Google
            </button>
            <button type="button" onClick={async () => { await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin } }); }} className="mt-2 px-6 py-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold w-full flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12.06C22 6.48 17.52 2 12 2S2 6.48 2 12.06C2 17.08 5.66 21.21 10.44 22v-7.04H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.21 22 17.08 22 12.06"/></svg>
              Continue with Facebook
            </button>
          </form>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;