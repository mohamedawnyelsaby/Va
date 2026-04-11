'use client';
import { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PaymentFlow({ booking }: { booking: any }) {
  const { isAvailable, authenticate, createPayment, sdkStatus } = usePi();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cashback, setCashback] = useState<number | null>(null);

  const handlePiPayment = async () => {
    if (!isAvailable) { setError('Please open this app in Pi Browser.'); setStatus('error'); return; }
    setLoading(true); setStatus('processing'); setError('');
    try {
      await authenticate(['username', 'payments']);
      const createRes = await fetch('/api/payments/pi/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, amount: booking.amount, memo: `Va Travel - ${booking.hotelName || booking.itemName || 'Booking'}` }),
      });
      if (!createRes.ok) throw new Error((await createRes.json()).error || 'Failed to create payment');
      const { paymentId, amount, memo } = await createRes.json();

      await createPayment({ amount, memo, metadata: { bookingId: booking.id, paymentId } }, {
        onReadyForServerApproval: async (piPaymentId: string) => {
          const res = await fetch('/api/payments/pi/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, piPaymentId }),
          });
          if (!res.ok) throw new Error('Approval failed');
        },
        onReadyForServerCompletion: async (piPaymentId: string, txid: string) => {
          const res = await fetch('/api/payments/pi/complete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, piPaymentId, txid }),
          });
          if (!res.ok) throw new Error('Completion failed');
          const result = await res.json();
          setCashback(result.cashback); setStatus('success'); setLoading(false);
        },
        onCancel: () => { setError('Payment cancelled.'); setStatus('error'); setLoading(false); },
        onError: (err: Error) => { setError(err?.message || 'Payment error'); setStatus('error'); setLoading(false); },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error'); setStatus('error'); setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>

      {/* Summary Card */}
      <div style={{ background: 'var(--vg-bg-card)', padding: '1.8rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '1.5rem', opacity: 0.6 }} />
        <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Payment Summary</div>

        {[
          { label: 'Hotel', value: booking.hotelName || booking.itemName },
          booking.checkIn && { label: 'Check-in', value: booking.checkIn },
          booking.checkOut && { label: 'Check-out', value: booking.checkOut },
        ].filter(Boolean).map((row: any) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--vg-border)' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--vg-gold-border)' }}>
          <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-2)' }}>Total</span>
          <span className="vg-stat-num" style={{ fontSize: '1.5rem' }}>π {booking.amount}</span>
        </div>
      </div>

      {/* Payment CTA */}
      <div style={{ background: 'var(--vg-bg-card)', padding: '1.8rem' }}>
        <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Pay with Pi Network</div>

        {status !== 'success' && (
          <>
            <button
              onClick={handlePiPayment}
              disabled={loading || !isAvailable}
              style={{
                width: '100%', padding: '1.1rem',
                background: loading ? 'var(--vg-gold-dim)' : !isAvailable ? 'var(--vg-bg-surface)' : 'var(--vg-gold)',
                border: !isAvailable ? '1px solid var(--vg-border)' : 'none',
                cursor: loading || !isAvailable ? 'not-allowed' : 'pointer',
                color: !isAvailable ? 'var(--vg-text-3)' : 'var(--vg-bg)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                transition: 'all 0.3s',
                marginBottom: '1rem',
              }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                : <><span style={{ fontSize: '1rem', lineHeight: 1 }}>π</span> Pay with Pi — π {booking.amount} <span style={{ opacity: 0.7, fontSize: '0.44rem' }}>+2% CASHBACK</span></>
              }
            </button>

            {!isAvailable && (
              <div style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid var(--vg-gold-border)', padding: '0.8rem 1rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-gold)', textAlign: 'center', lineHeight: 1.6 }}>
                Please open this app in Pi Browser to complete payment.
              </div>
            )}

            <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.4rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--vg-text-3)', textAlign: 'center' }}>
              SDK: {sdkStatus} · Pi: {isAvailable ? '✓' : '✗'}
            </div>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={40} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.5rem' }}>
              Payment <em style={{ color: '#10b981', fontStyle: 'italic' }}>Successful!</em>
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-2)', marginBottom: '0.5rem' }}>
              Your booking is confirmed.
            </p>
            {cashback !== null && (
              <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '0.6rem 1rem', display: 'inline-block', marginTop: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'var(--vg-gold)' }}>
                  +π {cashback.toFixed(4)} CASHBACK EARNED
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.15em', color: '#ef4444', marginBottom: '0.2rem' }}>PAYMENT FAILED</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(239,68,68,0.8)', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '1.5rem', opacity: 0.4 }} />
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.8rem', lineHeight: 1.6 }}>
          🔒 All payments secured by Pi Network blockchain
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
