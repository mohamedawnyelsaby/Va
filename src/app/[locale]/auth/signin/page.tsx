'use client';
import { usePi } from '@/components/providers/pi-provider';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Pi } from 'lucide-react';
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
  const [piLoading, setPiLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

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
    setPiLoading(true);
    try {
      if (!isAvailable) {
        toast({ title: 'Pi Browser Required', description: 'Please open this app in Pi Browser', variant: 'destructive' });
        return;
      }
      const piUser = await authenticate(['username', 'payments']);
      const res = await fetch('/api/pi/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: piUser.accessToken, uid: piUser.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      const result = await signIn('credentials', { email: data.user.email, password: data.user.id, redirect: false });
      if (result?.ok) {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      toast({ title: 'Error', description: 'Pi Network login failed', variant: 'destructive' });
    } finally {
      setPiLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: `/${locale}/dashboard` });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--vg-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,162,39,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2rem',
              fontWeight: 300,
              color: 'var(--vg-text)',
              letterSpacing: '-0.01em',
            }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </span>
          </Link>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.48rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--vg-text-3)',
            marginTop: '0.5rem',
          }}>
            Beyond Every Horizon
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--vg-bg-card)',
          border: '1px solid var(--vg-border)',
          padding: '2.5rem 2rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.6rem',
            fontWeight: 300,
            color: 'var(--vg-text)',
            marginBottom: '0.4rem',
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.82rem',
            color: 'var(--vg-text-2)',
            marginBottom: '2rem',
          }}>
            Sign in to continue your journey
          </p>

          {/* Pi Network Button — PRIMARY */}
          <button
            type="button"
            onClick={handlePiNetworkLogin}
            disabled={piLoading}
            style={{
              width: '100%',
              padding: '0.9rem 1rem',
              background: piLoading ? 'var(--vg-gold-dim)' : 'var(--vg-gold)',
              border: '1px solid var(--vg-gold)',
              color: 'var(--vg-bg)',
              cursor: piLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.5rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              transition: 'all 0.2s',
              opacity: piLoading ? 0.6 : 1,
            }}
          >
            <Pi size={14} />
            {piLoading ? 'Connecting...' : 'Continue with Pi Network'}
          </button>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              background: 'none',
              border: '1px solid var(--vg-border-2)',
              color: 'var(--vg-text-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.5rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--vg-gold-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--vg-border-2)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--vg-border)' }} />
            <span style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.44rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--vg-text-3)',
            }}>Or email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--vg-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.45rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--vg-text-3)',
                marginBottom: '0.5rem',
              }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--vg-bg-surface)',
                  border: '1px solid var(--vg-border)',
                  color: 'var(--vg-text)',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--vg-gold-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--vg-border)')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.45rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                }}>Password</label>
                <Link href={`/${locale}/auth/forgot-password`} style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.44rem',
                  letterSpacing: '0.12em',
                  color: 'var(--vg-gold)',
                  textDecoration: 'none',
                }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.8rem 0.75rem 1rem',
                    background: 'var(--vg-bg-surface)',
                    border: '1px solid var(--vg-border)',
                    color: 'var(--vg-text)',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--vg-gold-border)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--vg-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--vg-text-3)',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="vg-btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                marginTop: '0.5rem',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                justifyContent: 'center',
                fontSize: '0.5rem',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.82rem',
          color: 'var(--vg-text-3)',
          marginTop: '1.5rem',
        }}>
          Don&apos;t have an account?{' '}
          <Link href={`/${locale}/auth/signup`} style={{ color: 'var(--vg-gold)', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
