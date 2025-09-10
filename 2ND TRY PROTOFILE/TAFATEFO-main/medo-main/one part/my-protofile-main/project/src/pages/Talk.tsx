import React from 'react';

export default function Talk() {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{role: 'user'|'assistant'; content: string}[]>([]);
  const [loading, setLoading] = React.useState(false);
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

