import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Works() {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(localStorage.getItem('isAdmin') === '1');
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
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

