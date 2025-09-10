import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Contact() {
  const [submitting, setSubmitting] = React.useState(false);
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

