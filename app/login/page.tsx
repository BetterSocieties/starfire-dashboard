'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Starfire Dashboard login</h1>
      <p className="text-sm text-gray-600">Enter your email to receive a magic link.</p>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@bettersocieties.world"
          className="rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          disabled={status === 'sending' || status === 'sent'}
          className="rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending link...' : status === 'sent' ? 'Link sent' : 'Send magic link'}
        </button>
      </form>
      {status === 'sent' && <p className="text-sm text-green-700">Check your inbox for a login link.</p>}
      {status === 'error' && <p className="text-sm text-red-700">{errorMessage}</p>}
    </main>
  );
}
