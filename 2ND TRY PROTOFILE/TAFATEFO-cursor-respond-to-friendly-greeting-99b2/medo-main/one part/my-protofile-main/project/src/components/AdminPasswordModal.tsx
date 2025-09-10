import React, { useEffect, useRef, useState } from 'react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_PASSWORD = '6532';

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', '1');
      window.dispatchEvent(new CustomEvent('admin:changed', { detail: { isAdmin: true } }));
      onSuccess();
      onClose();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative mx-4 w-full max-w-sm">
        {/* Outer neon glow */}
        <div className="absolute -inset-4 rounded-2xl blur-2xl opacity-70 bg-gradient-to-r from-green-400/30 via-pink-400/30 to-blue-500/30" aria-hidden="true" />

        <form onSubmit={handleSubmit} className="relative rounded-2xl border border-white/10 bg-gray-900/90 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5">
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 via-pink-400 to-green-400 bg-clip-text text-transparent">Admin Access</h3>
            <p className="text-xs text-white/70">Long-press detected. Enter password to enable admin mode.</p>
          </div>

          {/* Input field with neon styles */}
          <div className="px-5 pt-4 pb-2">
            <div className="relative group">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-400"
              />
              {/* Inner glow */}
              <span className="pointer-events-none absolute -inset-1 rounded-xl blur-xl opacity-0 group-focus-within:opacity-60 transition-opacity bg-gradient-to-r from-green-400/40 via-pink-400/40 to-blue-500/40" />
              {/* Moving shine when focusing */}
              <span className="pointer-events-none absolute inset-x-[-20%] -top-2 h-8 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="block h-full w-1/3 bg-white/20 blur-md rounded-full animate-sweep" />
              </span>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 pt-3 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm text-white/80 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition">Cancel</button>
            <button type="submit" className="relative group px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-400/20 to-pink-500/20 border border-white/15 text-white">
              <span className="absolute -inset-1 rounded-full blur-2xl opacity-40 bg-gradient-to-r from-green-400/50 via-pink-400/50 to-blue-500/50" aria-hidden="true" />
              <span className="relative">Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordModal;