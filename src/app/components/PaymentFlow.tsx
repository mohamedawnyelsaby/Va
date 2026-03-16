// src/app/components/PaymentFlow.tsx
// ✅ FIXED: Proper paymentId passing, better error handling
'use client';

import { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pi, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentFlow({ booking }: { booking: any }) {
  const { isAvailable, authenticate, createPayment, sdkStatus } = usePi();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cashback, setCashback] = useState<number | null>(null);

  const handlePiPayment = async () => {
    if (!isAvailable) {
      setError('⚠️ Pi SDK غير متاح. افتح التطبيق في Pi Browser.');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError('');

    try {
      // ✅ Always authenticate with payments scope before paying
      await authenticate(['username', 'payments']);

      // Step 1: Create payment record in backend
      const createRes = await fetch('/api/payments/pi/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.amount,
          memo: `Va Travel - ${booking.hotelName || booking.itemName || 'Booking'}`,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'فشل إنشاء الدفع');
      }

      const { paymentId, amount, memo } = await createRes.json();
      console.log('✅ Payment record created:', paymentId);

      // Step 2: Pi SDK payment flow
      await createPayment(
        {
          amount,
          memo,
          metadata: {
            bookingId: booking.id,
            paymentId,
          },
        },
        {
          onReadyForServerApproval: async (piPaymentId: string) => {
            console.log('📝 Approving payment:', piPaymentId);

            // ✅ Send BOTH paymentId (ours) and piPaymentId (Pi SDK's)
            const approveRes = await fetch('/api/payments/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, piPaymentId }),
            });

            if (!approveRes.ok) {
              const err = await approveRes.json().catch(() => ({}));
              throw new Error(err.error || 'فشل الموافقة على الدفع');
            }

            console.log('✅ Payment approved');
          },

          onReadyForServerCompletion: async (piPaymentId: string, txid: string) => {
            console.log('⛓️ Completing payment:', txid);

            const completeRes = await fetch('/api/payments/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, piPaymentId, txid }),
            });

            if (!completeRes.ok) {
              const err = await completeRes.json().catch(() => ({}));
              throw new Error(err.error || 'فشل إتمام الدفع');
            }

            const result = await completeRes.json();
            console.log('🎉 Payment complete! Cashback:', result.cashback);

            setCashback(result.cashback);
            setStatus('success');
            setLoading(false);
          },

          onCancel: () => {
            setError('تم إلغاء الدفع من المستخدم');
            setStatus('error');
            setLoading(false);
          },

          onError: (err: Error) => {
            setError(err?.message || 'حدث خطأ في الدفع');
            setStatus('error');
            setLoading(false);
          },
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('Payment flow error:', message);
      setError(message);
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الحجز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الفندق:</span>
            <span className="font-semibold">{booking.hotelName || booking.itemName}</span>
          </div>
          {booking.checkIn && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">تسجيل الوصول:</span>
              <span>{booking.checkIn}</span>
            </div>
          )}
          {booking.checkOut && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المغادرة:</span>
              <span>{booking.checkOut}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>الإجمالي:</span>
            <span className="text-primary">π {booking.amount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Card>
        <CardHeader>
          <CardTitle>الدفع بـ Pi Network</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status !== 'success' && (
            <Button
              className="w-full h-14 bg-gradient-to-r from-[#00b3a5] to-[#26c6da] hover:opacity-90 text-white text-lg"
              onClick={handlePiPayment}
              disabled={loading || !isAvailable}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري معالجة الدفع...
                </>
              ) : (
                <>
                  <Pi className="mr-2 h-5 w-5" />
                  ادفع بـ Pi Network
                  <span className="mr-2 text-xs bg-white/20 px-2 py-1 rounded">
                    +2% كاشباك
                  </span>
                </>
              )}
            </Button>
          )}

          {!isAvailable && (
            <p className="text-sm text-center text-amber-600 bg-amber-50 p-3 rounded">
              ⚠️ يرجى فتح التطبيق في Pi Browser لإتمام الدفع
            </p>
          )}

          <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
            حالة SDK: <strong>{sdkStatus}</strong> | متاح: <strong>{isAvailable ? '✅' : '❌'}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Success */}
      {status === 'success' && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6 text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
              تم الدفع بنجاح! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              تم تأكيد حجزك
            </p>
            {cashback !== null && (
              <p className="text-sm font-semibold text-green-600">
                💰 حصلت على {cashback.toFixed(4)} Pi كاشباك!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">فشل الدفع</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground">
        🔒 جميع المدفوعات مؤمّنة بتقنية البلوكتشين
      </p>
    </div>
  );
}
