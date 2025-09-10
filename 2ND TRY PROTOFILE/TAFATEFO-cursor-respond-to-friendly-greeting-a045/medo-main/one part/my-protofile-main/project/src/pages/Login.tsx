import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [mode, setMode] = React.useState<'login'|'signup'>('login');
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

