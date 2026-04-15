'use client';
// PATH: src/app/[locale]/wallet/page.tsx
// FIX: use useParams() for dynamic locale instead of hardcoded '/en/hotels'
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePi } from '@/components/providers/pi-provider';
import { History, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';

export default function WalletPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { isAvailable, isAuthenticated, user, authenticate, paymentHistory, activePayment } = usePi();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try { await authenticate(['username', 'payments']); }
    catch { } finally { setLoading(false); }
  };

  if (!isAvailable) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '3rem 2.5rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '2rem', opacity: 0.6 }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '2rem', color: 'var(--vg-gold)', marginBottom: '1.2rem', lineHeight: 1 }}>π</div>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.8rem' }}>Pi Browser Required</div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7 }}>
          Please open Va Travel in Pi Browser to access your wallet.
        </p>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '2rem', opacity: 0.6 }} />
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', padding: '3rem 2.5rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
        <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))', marginBottom: '2rem' }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '2.5rem', color: 'var(--vg-gold)', marginBottom: '1.2rem', lineHeight: 1 }}>π</div>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.6rem' }}>
          Connect Pi <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>Wallet</em>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Connect your Pi Network wallet to view your balance, transaction history, and earn cashback on every booking.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="vg-btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Connecting...' : 'Connect Pi Wallet'}
        </button>
      </div>
    </div>
  );

  const statusIcon: Record<string, any> = {
    completed: <CheckCircle size={16} style={{ color: '#10b981' }} />,
    cancelled: <XCircle size={16} style={{ color: '#ef4444' }} />,
    pending:   <Clock size={16} style={{ color: 'var(--vg-gold)' }} />,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: `clamp(2.5rem,5vw,4rem) ${VG.section.x}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(201,162,39,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Pi Network</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          My <em className="vg-italic">Wallet</em>
        </h1>
      </div>

      <div style={{ padding: `clamp(2rem,5vw,4rem) ${VG.section.x}`, maxWidth: '700px', margin: '0 auto' }}>

        {/* Balance card */}
        <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(201,162,39,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--vg-gold)', marginBottom: '1.2rem' }}>
            Pi Network User
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '52px', height: '52px', background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-space-mono)', fontSize: '1.5rem', color: 'var(--vg-gold)' }}>π</div>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 300, color: 'var(--vg-text)' }}>{user?.username}</div>
              <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', color: 'var(--vg-text-3)' }}>Pi Network Account</div>
            </div>
          </div>

          {activePayment && (
            <div style={{ background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-gold-border)', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.15em', color: 'var(--vg-gold)' }}>ACTIVE PAYMENT</span>
              <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.small, color: 'var(--vg-gold)' }}>π {activePayment.amount}</span>
            </div>
          )}
        </div>

        {/* Transaction history */}
        <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)' }}>
          <div style={{ padding: '1.5rem 1.8rem', borderBottom: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div className="vg-feat-icon" style={{ width: '30px', height: '30px' }}><History size={13} /></div>
            <div className="vg-overline" style={{ margin: 0 }}>Payment History</div>
          </div>

          {paymentHistory.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', color: 'var(--vg-text-3)', marginBottom: '0.6rem' }}>No Transactions</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-3)', marginBottom: '1.5rem' }}>
                Your Pi payments will appear here after your first booking.
              </p>
              {/* FIX: was hardcoded '/en/hotels' — now uses dynamic locale */}
              <Link href={`/${locale}/hotels`} className="vg-btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Explore Hotels <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
              {paymentHistory.map((p) => (
                <div key={p.identifier} style={{ background: 'var(--vg-bg-card)', padding: '1.2rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', border: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {statusIcon[p.status] || statusIcon.pending}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.body, color: 'var(--vg-text)', marginBottom: '0.2rem' }}>{p.memo}</div>
                      <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.12em', color: 'var(--vg-text-3)' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="vg-stat-num" style={{ fontSize: '1rem' }}>π {p.amount}</div>
                    <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.status === 'completed' ? '#10b981' : p.status === 'cancelled' ? '#ef4444' : 'var(--vg-gold)', marginTop: '0.15rem' }}>
                      {p.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
