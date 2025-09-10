import React, { useEffect, useState } from 'react';
import NavNeonButton from './NavNeonButton';
import LogoMark from './LogoMark';
import { supabase } from '../lib/supabaseClient';

type Variant = 'green' | 'pink' | 'blue';

interface NavItem {
  label: string;
  to: string;
}

const baseItems: NavItem[] = [
  { label: 'HOME', to: '/' },
  { label: 'OUR WORKS', to: '/works' },
  { label: 'SKILLS', to: '/skills' },
  { label: 'ABOUT', to: '/about' },
  { label: 'CERTIFICATION', to: '/certification' },
  { label: 'RATING', to: '/rating' },
  { label: 'TALK', to: '/talk' },
  { label: 'CONTACT', to: '/contact' },
  { label: 'LOGIN', to: '/login' },
];

const variants: Variant[] = ['green', 'pink', 'blue'];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(typeof window !== 'undefined' && localStorage.getItem('isAdmin') === '1');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const id = setInterval(() => {
      setModeIdx((i) => (i + 1) % variants.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      setIsLoggedIn(!!user);
      const meta: any = user?.user_metadata || {};
      setAvatarUrl(meta.avatar_url || meta.picture || null);
    };
    syncUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => syncUser());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      // Use default scope; then force-clear any persisted tokens as a fallback
      await supabase.auth.signOut();
    } catch (e) {
      // noop
    } finally {
      // clear admin state as well
      localStorage.removeItem('isAdmin');
      window.dispatchEvent(new CustomEvent('admin:changed', { detail: { isAdmin: false } }));
      // immediately hide sign-out and avatar from UI
      setIsLoggedIn(false);
      setAvatarUrl(null);
      // Hard clear possible Supabase auth tokens if still present
      try {
        const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
        const ref = url ? (url.match(/^https:\/\/([^.]+)/)?.[1] || '') : '';
        if (ref) {
          localStorage.removeItem(`sb-${ref}-auth-token`);
        }
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refresh-token');
      } catch {}
      // Ensure any stale UI/session is gone: hard reload current page
      setTimeout(() => {
        window.location.reload();
      }, 10);
    }
  };

  useEffect(() => {
    const onAdmin = (e: any) => setIsAdmin(!!e?.detail?.isAdmin);
    window.addEventListener('admin:changed', onAdmin);
    return () => window.removeEventListener('admin:changed', onAdmin);
  }, []);

  const exitAdmin = () => {
    localStorage.removeItem('isAdmin');
    window.dispatchEvent(new CustomEvent('admin:changed', { detail: { isAdmin: false } }));
    setIsAdmin(false);
  };

  const mode = variants[modeIdx];

  return (
    <nav className="fixed top-0 inset-x-0 z-30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="flex items-center justify-between px-6 py-4 md:px-8">
            <LogoMark />

            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current mt-1.5" />
              <span className="block w-5 h-0.5 bg-current mt-1.5" />
            </button>

            <ul className="hidden md:flex md:flex-wrap items-center gap-3 md:gap-4 text-sm font-semibold">
              {baseItems
                .filter((item) => !(item.to === '/login' && isLoggedIn))
                .map((item) => (
                <li key={item.to}>
                  <NavNeonButton to={item.to} variant={mode as Variant}>{item.label}</NavNeonButton>
                </li>
              ))}
              {isLoggedIn && (
                <li className="flex items-center gap-3 pl-2">
                  {avatarUrl && (
                    <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-white/20" />
                  )}
                  <button
                    onClick={handleSignOut}
                    className="group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-red-400/20 to-red-500/20 border-2 border-red-400/50 text-red-300"
                  >
                    <span className="btn-gleam btn-gleam-pink" aria-hidden="true" />
                    <span className="btn-beam" aria-hidden="true" />
                    <span className="relative z-10">Sign out</span>
                    <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-red-400/50 to-red-500/50" aria-hidden="true" />
                  </button>
                </li>
              )}
              {isAdmin && (
                <li>
                  <button onClick={exitAdmin} className="group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-red-400/20 to-red-500/20 border-2 border-red-400/50 text-red-300">
                    <span className="btn-gleam btn-gleam-pink" aria-hidden="true" />
                    <span className="btn-beam" aria-hidden="true" />
                    <span className="relative z-10">Exit Admin</span>
                    <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-red-400/50 to-red-500/50" aria-hidden="true" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {open && (
            <div className="md:hidden px-4 pb-4">
              <ul className="grid gap-2">
                <li className="flex items-center gap-3 py-1">
                  {avatarUrl && <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-white/20" />}
                  {isLoggedIn && (
                    <button onClick={() => { handleSignOut(); setOpen(false); }} className="w-full justify-center group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-red-400/20 to-red-500/20 border-2 border-red-400/50 text-red-300">
                      <span className="btn-gleam btn-gleam-pink" aria-hidden="true" />
                      <span className="btn-beam" aria-hidden="true" />
                      <span className="relative z-10">Sign out</span>
                      <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-red-400/50 to-red-500/50" aria-hidden="true" />
                    </button>
                  )}
                </li>
                {baseItems
                  .filter((item) => !(item.to === '/login' && isLoggedIn))
                  .map((item) => (
                  <li key={item.to}>
                    <NavNeonButton to={item.to} variant={mode as Variant} className="w-full justify-center" onClick={() => setOpen(false)}>
                      {item.label}
                    </NavNeonButton>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <button onClick={() => { exitAdmin(); setOpen(false); }} className="w-full justify-center group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-gradient-to-r from-red-400/20 to-red-500/20 border-2 border-red-400/50 text-red-300">
                      <span className="btn-gleam btn-gleam-pink" aria-hidden="true" />
                      <span className="btn-beam" aria-hidden="true" />
                      <span className="relative z-10">Exit Admin</span>
                      <span className="absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe bg-gradient-to-r from-red-400/50 to-red-500/50" aria-hidden="true" />
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;