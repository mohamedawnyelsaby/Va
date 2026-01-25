// src/app/components/PaymentFlow.tsx
'use client';

import { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pi, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentFlow({ booking }: { booking: any }) {
  const { isAvailable, createPayment } = usePi();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePiPayment = async () => {
    if (!isAvailable) {
      setError('⚠️ Pi SDK not available. Please open in Pi Browser.');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError('');

    try {
      // Step 1: Create payment record on backend
      const createRes = await fetch('/api/payments/pi/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (!createRes.ok) throw new Error('Failed to create payment');
      const { paymentId, amount, memo } = await createRes.json();

      // Step 2: Initiate Pi SDK payment
      await createPayment(
        { amount, memo, metadata: { bookingId: booking.id, paymentId } },
        {
          onReadyForServerApproval: async (piPaymentId) => {
            // Step 3: Approve payment on backend
            const approveRes = await fetch('/api/payments/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, piPaymentId }),
            });
            if (!approveRes.ok) throw new Error('Server approval failed');
          },

          onReadyForServerCompletion: async (piPaymentId, txid) => {
            // Step 4: Complete payment on backend
            const completeRes = await fetch('/api/payments/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, piPaymentId, txid }),
            });
            if (!completeRes.ok) throw new Error('Payment completion failed');
            const result = await completeRes.json();

            setStatus('success');
            setLoading(false);
            console.log('Payment complete! Cashback:', result.cashback);
          },

          onCancel: () => {
            setError('Payment cancelled by user');
            setStatus('error');
            setLoading(false);
          },

          onError: (err) => {
            setError(err?.message || 'Payment failed');
            setStatus('error');
            setLoading(false);
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-semibold">{booking.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in:</span>
              <span>{booking.checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out:</span>
              <span>{booking.checkOut}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{booking.amount} π</span>
            </div>
          </CardContent>
        </Card>

        {/* Pi Network Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Pay with Pi Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-16 bg-gradient-to-r from-[#00b3a5] to-[#26c6da] hover:opacity-90 text-white"
              onClick={handlePiPayment}
              disabled={loading || !isAvailable || status === 'success'}
            >
              {loading && status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Pi className="mr-2 h-5 w-5" />
                  Pay with Pi Network
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    +2% Cashback
                  </span>
                </>
              )}
            </Button>

            {!isAvailable && (
              <p className="text-sm text-center text-amber-600">
                ⚠️ Pi SDK not available. Please open in Pi Browser.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {status === 'success' && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Payment Successful!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your booking is confirmed. Check your email for details.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'error' && error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Payment Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <p className="text-xs text-center text-muted-foreground">
          🔒 Payments are secured with blockchain technology. Your data is encrypted and never stored.
        </p>
      </div>
    </div>
  );
}
