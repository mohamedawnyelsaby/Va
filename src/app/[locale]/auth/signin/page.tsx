'use client';
import { usePi } from '@/components/providers/pi-provider';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

// A request that never answers must become a visible error, not an endless
// "Connecting...". Pi Browser has no DevTools, so the step name + timeout is
// the only way to see where a login hangs.
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms / 1000}s (${label})`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export default function SignInPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const { isAvailable, authenticate } = usePi();
  const [isPiLoading, setIsPiLoading] = useState(false);
  const [piStep, setPiStep] = useState('');
  // Only filled when the page is opened with ?debug=1 (see handlePiNetworkLogin).
  const [debugInfo, setDebugInfo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handlePiNetworkLogin = async () => {
    // Tracks which stage we're in so a failure can say WHERE it failed.
    // This used to be a bare `catch {}` that showed the same fixed message
    // for every possible failure (SDK, server verification, session), which
    // made it impossible to diagnose from a phone with no DevTools.
    let step = 'starting';
    try {
      if (!isAvailable) {
        toast({ title: 'Pi Browser Required', description: 'Please open this app in Pi Browser', variant: 'destructive' });
        return;
      }
      setIsPiLoading(true);
      step = 'Pi SDK authenticate';
      setPiStep('1/2');
      const piUser = await withTimeout(authenticate(['username', 'payments', 'wallet_address']), 40_000, step);
      // Session is created only through the 'pi-network' provider, which
      // re-verifies the access token with Pi's servers.
      step = 'creating session';
      setPiStep('2/2');
      const result = await withTimeout(
        signIn('pi-network', {
          accessToken: piUser.accessToken,
          uid: piUser.uid,
          username: piUser.username,
          redirect: false,
        }),
        20_000,
        step
      );
      if (result?.ok) {
        // signIn() can report ok while the browser refused to keep the session
        // cookie (embedded / third-party context). Check before navigating,
        // otherwise the protected page bounces straight back to sign-in.
        step = 'checking session';
        const check = await withTimeout(
          fetch('/api/auth/session', { cache: 'no-store' }).then((r) => r.json()),
          10_000,
          step
        );
        if (!check?.user) {
          throw new Error('Signed in, but the browser did not keep the session cookie');
        }
        // Hard navigation so the very first request already carries the cookie.
        window.location.assign(`/${locale}/dashboard`);
      } else {
        // Previously a failed signIn() was silently ignored here.
        throw new Error(result?.error || 'Session was not created');
      }
    } catch (err) {
      // Pi SDK rejections are not always Error instances.
      const detail =
        err instanceof Error ? err.message
        : typeof err === 'string' ? err
        : (() => { try { return JSON.stringify(err); } catch { return 'unknown error'; } })();
      // Technical details stay in the console (not shown to users). Keep any
      // on-screen diagnostics behind an explicit flag such as ?debug=1.
      console.error(`[pi-login] ${step}:`, detail);
      // Pi Browser has no DevTools: with ?debug=1 show where it failed on screen.
      // Only the step name and the error message are shown (never tokens).
      if (new URLSearchParams(window.location.search).get('debug') === '1') {
        setDebugInfo(`${step}: ${detail}`);
      }
      const transient = /PiServerError|timed out/i.test(detail);
      toast({
        title: 'Pi Network login failed',
        description: transient
          ? 'Pi Network is responding slowly. Please try again in a moment.'
          : 'Could not sign you in with Pi Network. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPiLoading(false);
      setPiStep('');
    }
  };

  if (!mounted) {return null;}

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--vg-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 1.5rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grain + glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,162,39,0.06) 0%, transparent 70%)',
      }} />

      {/* Decorative lines */}
      <div style={{
        position: 'absolute', top: '10%', left: 0, width: '100%', height: '1px',
        background: 'linear-gradient(to right, transparent, var(--vg-gold-border), transparent)',
        opacity: 0.4,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, width: '100%', height: '1px',
        background: 'linear-gradient(to right, transparent, var(--vg-gold-border), transparent)',
        opacity: 0.4,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <div style={{
              fontFamily: 'var(--font-cormorant)', fontSize: '2rem',
              fontWeight: 300, color: 'var(--vg-text)',
            }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </div>
          </Link>
          <div style={{
            fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--vg-text-3)', marginTop: '0.5rem',
          }}>
            Welcome Back
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--vg-bg-card)',
          border: '1px solid var(--vg-border)',
          padding: '2.5rem',
        }}>

          {/* Gold top accent */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)',
            marginBottom: '2rem',
            opacity: 0.6,
          }} />

          {/* Pi Network (the only sign-in method) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Pi Network */}
            <button
              type="button"
              onClick={handlePiNetworkLogin}
              disabled={isPiLoading}
              style={{
                width: '100%', padding: '0.85rem 1rem',
                background: isPiLoading ? 'var(--vg-gold-dim)' : 'var(--vg-gold-dim)',
                border: '1px solid var(--vg-gold-border)',
                cursor: isPiLoading ? 'not-allowed' : 'pointer',
                color: 'var(--vg-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.83rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!isPiLoading) {(e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.2)';} }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)'; }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>π</span>
              {isPiLoading ? `Connecting... ${piStep}` : 'Continue with Pi Network'}
            </button>
            {debugInfo && (
              <p
                dir="ltr"
                style={{
                  marginTop: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
                  color: '#ffb4b4', border: '1px solid rgba(255,180,180,0.4)',
                  wordBreak: 'break-word', textAlign: 'left',
                }}
              >
                {debugInfo}
              </p>
            )}
          </div>

          {/* Bottom accent */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)',
            marginTop: '2rem', opacity: 0.6,
          }} />
        </div>

      </div>
    </div>
  );
}
