import type { Handler } from '@netlify/functions';

// Simple echo-style placeholder. Replace with real AI call if you provide an API key.
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    const messages: { role: 'user'|'assistant'; content: string }[] = body.messages || [];
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const reply = lastUser ? `You said: ${lastUser.content}` : 'Hello! How can I help?';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (e) {
    return { statusCode: 400, body: 'Invalid request' };
  }
};

