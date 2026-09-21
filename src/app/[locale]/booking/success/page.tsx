// src/app/[locale]/booking/success/page.tsx
// Landing page after a successful Pi payment (PaymentFlow redirects here).
// It only DISPLAYS values from the query string — the booking itself was
// already confirmed on the server — so nothing here is trusted.
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';

  const hotelName = searchParams.get('hotelName');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const cashback = searchParams.get('cashback');

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Payment successful</h1>
      <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>
        Your booking is confirmed{hotelName ? ` at ${hotelName}` : ''}.
      </p>
      {checkIn && checkOut && (
        <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>
          {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}
        </p>
      )}
      {cashback && Number(cashback) > 0 && (
        <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>You earned π {Number(cashback)} cashback.</p>
      )}
      <div style={{ marginTop: '2rem' }}>
        <Link href={`/${locale}/bookings`} className="vg-btn-outline">
          View my bookings
        </Link>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
