'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error('Error:', error); }, [error]);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--vg-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', paddingTop: '80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(239,68,68,0.03) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        {/* Error symbol */}
        <div style={{
          fontFamily: 'var(--font-cormorant)', fontSize: '6rem', fontWeight: 300,
          color: 'var(--vg-text-3)', lineHeight: 1, marginBottom: '1.5rem',
          opacity: 0.4,
        }}>✕</div>

        <div className="vg-overline" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          Error
        </div>

        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>
          Something Went <em className="vg-italic">Wrong</em>
        </h1>

        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--vg-text-2)', lineHeight: 1.75, marginBottom: '0.5rem' }}>
          We encountered an unexpected error. Our team has been notified.
        </p>

        {error.message && (
          <div style={{
            background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)',
            padding: '0.8rem 1.2rem', marginBottom: '2rem', fontFamily: 'var(--font-space-mono)',
            fontSize: '0.5rem', letterSpacing: '0.08em', color: 'var(--vg-text-3)',
            textAlign: 'left', wordBreak: 'break-all',
          }}>
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="vg-btn-primary" style={{ padding: '0.9rem 2rem' }}>
            Try Again
          </button>
          <button onClick={() => window.location.href = '/'} className="vg-btn-outline" style={{ padding: '0.9rem 2rem' }}>
            Go Home
          </button>
        </div>

        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.74rem', color: 'var(--vg-text-3)', marginTop: '2rem' }}>
          Need help?{' '}
          <a href="mailto:support@vatravel.com" style={{ color: 'var(--vg-gold)', textDecoration: 'none' }}>
            support@vatravel.com
          </a>
        </p>
      </div>
    </div>
  );
}
