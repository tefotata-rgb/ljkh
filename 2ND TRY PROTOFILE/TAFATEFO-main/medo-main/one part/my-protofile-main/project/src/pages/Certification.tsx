import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Certification() {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(localStorage.getItem('isAdmin') === '1');
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [uploading, setUploading] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
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

