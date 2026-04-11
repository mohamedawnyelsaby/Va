'use client';
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--vg-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 1.5rem 2rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,162,39,0.06) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>

        {/* Back link */}
        <Link href={`/${locale}/auth/signin`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          textDecoration: 'none', fontFamily: 'var(--font-space-mono)',
          fontSize: '0.44rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--vg-text-3)', marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}>
          <ArrowLeft size={12} /> Back to Sign In
        </Link>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: 'var(--vg-text)' }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </div>
          </Link>
          <div style={{
            fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--vg-text-3)', marginTop: '0.5rem',
          }}>
            Reset Password
          </div>
        </div>

        <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2.5rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '2rem', opacity: 0.6 }} />

          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {/* Gold check */}
              <div style={{
                width: '52px', height: '52px',
                border: '1px solid var(--vg-gold-border)',
                background: 'var(--vg-gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--vg-gold)', fontSize: '1.4rem',
              }}>✓</div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.75rem' }}>
                Check Your Email
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                If an account exists for <span style={{ color: 'var(--vg-gold)' }}>{email}</span>, you will receive a password reset link shortly.
              </p>
              <Link href={`/${locale}/auth/signin`} className="vg-btn-outline" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7, marginBottom: '1.8rem' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block', fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.46rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'var(--vg-text-3)', marginBottom: '0.6rem',
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--vg-text-3)' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--vg-bg-surface)',
                        border: '1px solid var(--vg-border)',
                        padding: '0.85rem 0.9rem 0.85rem 2.5rem',
                        fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
                        color: 'var(--vg-text)', outline: 'none', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                      onBlur={e => e.target.style.borderColor = 'var(--vg-border)'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '1rem',
                    background: loading ? 'var(--vg-gold-dim)' : 'var(--vg-gold)',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'var(--vg-bg)', fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.52rem', letterSpacing: '0.25em', textTransform: 'uppercase',
                    transition: 'background 0.3s',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '2rem', opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
