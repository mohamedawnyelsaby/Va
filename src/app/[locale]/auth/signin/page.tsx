'use client';
import { usePi } from '@/components/providers/pi-provider';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const { isAvailable, authenticate } = usePi();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPiLoading, setIsPiLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        toast({ title: 'Error', description: 'Invalid email or password', variant: 'destructive' });
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePiNetworkLogin = async () => {
    try {
      if (!isAvailable) {
        toast({ title: 'Pi Browser Required', description: 'Please open this app in Pi Browser', variant: 'destructive' });
        return;
      }
      setIsPiLoading(true);
      const piUser = await authenticate(['username', 'payments']);
      const res = await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: piUser.accessToken, uid: piUser.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      const result = await signIn('credentials', {
        email: data.user.email, password: data.user.id, redirect: false,
      });
      if (result?.ok) {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      toast({ title: 'Error', description: 'Pi Network login failed', variant: 'destructive' });
    } finally {
      setIsPiLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: `/${locale}/dashboard` });
    } catch {
      toast({ title: 'Error', description: 'Google login failed', variant: 'destructive' });
    }
  };

  if (!mounted) return null;

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

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block', fontFamily: 'var(--font-space-mono)',
                fontSize: '0.46rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--vg-text-3)', marginBottom: '0.6rem',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{
                  position: 'absolute', left: '0.9rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--vg-text-3)',
                }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--vg-bg-surface)',
                    border: '1px solid var(--vg-border)',
                    padding: '0.85rem 0.9rem 0.85rem 2.5rem',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
                    color: 'var(--vg-text)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--vg-border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={{
                display: 'block', fontFamily: 'var(--font-space-mono)',
                fontSize: '0.46rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--vg-text-3)', marginBottom: '0.6rem',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{
                  position: 'absolute', left: '0.9rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--vg-text-3)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--vg-bg-surface)',
                    border: '1px solid var(--vg-border)',
                    padding: '0.85rem 2.8rem 0.85rem 2.5rem',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
                    color: 'var(--vg-text)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--vg-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.9rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--vg-text-3)', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: 'right', marginBottom: '1.8rem' }}>
              <Link href={`/${locale}/auth/forgot-password`} style={{
                fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem',
                letterSpacing: '0.15em', color: 'var(--vg-gold)',
                textDecoration: 'none',
              }}>
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '1rem',
                background: isLoading ? 'var(--vg-gold-dim)' : 'var(--vg-gold)',
                border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                color: 'var(--vg-bg)', fontFamily: 'var(--font-space-mono)',
                fontSize: '0.52rem', letterSpacing: '0.25em', textTransform: 'uppercase',
                transition: 'background 0.3s',
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            margin: '1.8rem 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--vg-border)' }} />
            <span style={{
              fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)',
            }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--vg-border)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%', padding: '0.85rem 1rem',
                background: 'none', border: '1px solid var(--vg-border)',
                cursor: 'pointer', color: 'var(--vg-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.83rem',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-border-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-text-2)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

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
              onMouseEnter={e => { if (!isPiLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)'; }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>π</span>
              {isPiLoading ? 'Connecting...' : 'Continue with Pi Network'}
            </button>
          </div>

          {/* Bottom accent */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)',
            marginTop: '2rem', opacity: 0.6,
          }} />
        </div>

        {/* Sign up link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
            color: 'var(--vg-text-3)',
          }}>
            Don&apos;t have an account?{' '}
            <Link href={`/${locale}/auth/signup`} style={{
              color: 'var(--vg-gold)', textDecoration: 'none',
            }}>
              Create one
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
