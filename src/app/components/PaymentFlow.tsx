// PATH: src/app/components/PaymentFlow.tsx
// UPDATED: Redirects to /booking/success after payment + improved UI
'use client';
import { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';
import { useParams, useRouter } from 'next/navigation';

export default function PaymentFlow({ booking }: { booking: any }) {
  const { isAvailable, authenticate, createPayment, sdkStatus } = usePi();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  const [status,   setStatus]   = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [cashback, setCashback] = useState<number | null>(null);
  const [step,     setStep]     = useState<string>('');

  const handlePiPayment = async () => {
    if (!isAvailable) { setError('Please open this app in Pi Browser.'); setStatus('error'); return; }
    setLoading(true); setStatus('processing'); setError(''); setStep('Connecting to Pi Network…');

    try {
      await authenticate(['username', 'payments']);
      setStep('Creating payment…');

      const createRes = await fetch('/api/payments/pi/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.amount,
          memo: `Va Travel - ${booking.hotelName || booking.itemName || 'Booking'}`,
        }),
      });
      if (!createRes.ok) throw new Error((await createRes.json()).error || 'Failed to create payment');
      const { paymentId, amount, memo } = await createRes.json();

      setStep('Waiting for Pi confirmation…');

      await createPayment({ amount, memo, metadata: { bookingId: booking.id, paymentId } }, {
        onReadyForServerApproval: async (piPaymentId: string) => {
          setStep('Approving payment…');
          const res = await fetch('/api/payments/pi/approve', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, piPaymentId }),
          });
          if (!res.ok) throw new Error('Approval failed');
        },
        onReadyForServerCompletion: async (piPaymentId: string, txid: string) => {
          setStep('Completing payment…');
          const res = await fetch('/api/payments/pi/complete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, piPaymentId, txid }),
          });
          if (!res.ok) throw new Error('Completion failed');
          const result = await res.json();
          const cb = result.cashback || 0;
          setCashback(cb);
          setStatus('success');
          setLoading(false);
          setStep('');

          // ✅ Redirect to success page after short delay
          setTimeout(() => {
            const successParams = new URLSearchParams({
              bookingId:  booking.id || '',
              hotelName:  booking.hotelName || booking.itemName || '',
              checkIn:    booking.checkIn || '',
              checkOut:   booking.checkOut || '',
              guests:     String(booking.guests || 1),
              amount:     String(booking.amount || 0),
              currency:   booking.currency || 'PI',
              cashback:   String(cb),
              txid:       txid || '',
            });
            router.push(`/${locale}/booking/success?${successParams.toString()}`);
          }, 2000);
        },
        onCancel: () => { setError('Payment cancelled.'); setStatus('error'); setLoading(false); setStep(''); },
        onError: (err: Error) => { setError(err?.message || 'Payment error'); setStatus('error'); setLoading(false); setStep(''); },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
      setLoading(false);
      setStep('');
    }
  };

  const PAYMENT_STEPS = [
    'Connecting to Pi Network…',
    'Creating payment…',
    'Waiting for Pi confirmation…',
    'Approving payment…',
    'Completing payment…',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>

      {/* Summary */}
      <div style={{ background: 'var(--vg-bg-card)', padding: '1.8rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '1.5rem', opacity: 0.6 }} />
        <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Payment Summary</div>

        {[
          { label: 'Hotel',      value: booking.hotelName || booking.itemName },
          booking.checkIn  && { label: 'Check-in',  value: booking.checkIn },
          booking.checkOut && { label: 'Check-out', value: booking.checkOut },
        ].filter(Boolean).map((row: any) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--vg-border)' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)' }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--vg-gold-border)' }}>
          <span style={{ ...monoLabel, textTransform: 'uppercase' }}>Total</span>
          <span className="vg-stat-num" style={{ fontSize: '1.5rem' }}>π {booking.amount}</span>
        </div>
      </div>

      {/* Payment CTA */}
      <div style={{ background: 'var(--vg-bg-card)', padding: '1.8rem' }}>
        <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Pay with Pi Network</div>

        {/* Processing steps */}
        {status === 'processing' && (
          <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PAYMENT_STEPS.map((s, i) => {
                const currentIdx = PAYMENT_STEPS.indexOf(step);
                const isDone = i < currentIdx;
                const isActive = s === step;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isDone || isActive ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                    <div style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                      {isDone ? (
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                      ) : isActive ? (
                        <Loader2 size={14} style={{ color: 'var(--vg-gold)', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--vg-text-3)', margin: '4px 5px' }} />
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: isDone ? '#10b981' : isActive ? 'var(--vg-gold)' : 'var(--vg-text-3)' }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {status !== 'success' && (
          <>
            <button
              onClick={handlePiPayment}
              disabled={loading || !isAvailable}
              className={loading || !isAvailable ? '' : 'vg-btn-primary'}
              style={{
                width: '100%', padding: '1.1rem',
                background: loading ? 'var(--vg-gold-dim)' : !isAvailable ? 'var(--vg-bg-surface)' : 'var(--vg-gold)',
                border: !isAvailable ? '1px solid var(--vg-border)' : 'none',
                cursor: loading || !isAvailable ? 'not-allowed' : 'pointer',
                color: !isAvailable ? 'var(--vg-text-3)' : 'var(--vg-bg)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: VG.font.button,
                letterSpacing: VG.tracking.normal,
                textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                transition: VG.transition.normal,
                marginBottom: '0.75rem',
              }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                : <><span style={{ fontSize: '1rem', lineHeight: 1 }}>π</span> Pay with Pi — π {booking.amount} <span style={{ opacity: 0.7, fontSize: VG.font.micro }}>+2% CASHBACK</span></>
              }
            </button>

            {!isAvailable && (
              <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '0.8rem 1rem', fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-gold)', textAlign: 'center', lineHeight: 1.6 }}>
                Open in Pi Browser to complete payment.
              </div>
            )}

            <div style={{ ...monoLabel, textAlign: 'center', color: 'var(--vg-text-3)', display: 'block', marginTop: '0.4rem' }}>
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
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-2)', marginBottom: '0.5rem' }}>
              Redirecting to your confirmation…
            </p>
            {cashback !== null && (
              <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '0.5rem 1rem', display: 'inline-block', marginTop: '0.5rem' }}>
                <span style={{ ...monoLabel, color: 'var(--vg-gold)' }}>+π {cashback.toFixed(4)} CASHBACK EARNED</span>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ ...monoLabel, color: '#ef4444', marginBottom: '0.2rem' }}>PAYMENT FAILED</div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'rgba(239,68,68,0.85)', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginTop: '1.5rem', opacity: 0.4 }} />
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: VG.font.small, color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.8rem', lineHeight: 1.6 }}>
          🔒 All payments secured by Pi Network blockchain
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
