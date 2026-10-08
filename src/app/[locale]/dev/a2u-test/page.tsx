'use client';
// PATH: src/app/[locale]/dev/a2u-test/page.tsx
//
// Testnet-only helper page. Open it inside Pi Browser on the TESTNET
// deployment, signed in with Pi, and press the button: the app sends a
// tiny test payment (A2U) to your own Pi wallet. Pi requires 5 unique
// wallets to receive one before granting a Mainnet app wallet.
// On a mainnet deployment the API answers 404 and this page says so.

import { use, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function A2UTestPage({ params }: Props) {
  const { locale } = use(params);
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);

  const run = async () => {
    setBusy(true);
    setMessage('');
    setOk(null);
    try {
      const res = await fetch('/api/dev/a2u-test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        setOk(false);
        setMessage('Not available here — this only works on the Testnet deployment.');
      } else if (!res.ok) {
        setOk(false);
        setMessage(data.error || 'Failed.');
      } else {
        setOk(true);
        setMessage(`Sent ${data.amount} test Pi ✅  (payment ${data.identifier})`);
      }
    } catch {
      setOk(false);
      setMessage('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem 3rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>A2U test (Testnet)</h1>
      <p style={{ lineHeight: 1.6, marginBottom: '1.5rem', opacity: 0.8 }}>
        Sends a tiny test payment from the app wallet to your own Pi account. Testnet only — no real Pi.
      </p>

      {status === 'loading' && <p>Loading…</p>}

      {status === 'unauthenticated' && (
        <Link
          href={`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`/${locale}/dev/a2u-test`)}`}
          style={{ display: 'inline-block', padding: '0.8rem 1.2rem', background: '#6b3fa0', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
        >
          Sign in with Pi first
        </Link>
      )}

      {status === 'authenticated' && (
        <button
          onClick={run}
          disabled={busy}
          style={{ padding: '0.9rem 1.4rem', background: '#6b3fa0', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'Sending… (can take ~20s)' : 'Send me 0.01 test Pi'}
        </button>
      )}

      {message && (
        <p style={{ marginTop: '1.25rem', lineHeight: 1.6, color: ok ? '#10b981' : '#ef4444', wordBreak: 'break-word' }}>
          {message}
        </p>
      )}
    </main>
  );
}
