'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, Users, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PaymentFlow from '@/app/components/PaymentFlow';
import Link from 'next/link';

function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.3em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>{label || 'Loading'}</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const router = useRouter();
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const itemId   = searchParams.get('itemId');
  const roomType = searchParams.get('roomType') || 'Standard';
  const checkIn  = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests   = parseInt(searchParams.get('guests') || '1');
  const rooms    = parseInt(searchParams.get('rooms') || '1');

  useEffect(() => {
    if (status === 'loading') return;
    if (!itemId || !checkIn || !checkOut) {
      setError('Missing booking details. Please go back and select dates.'); setLoading(false); return;
    }
    initBooking();
  }, [status, itemId]);

  const initBooking = async () => {
    try {
      setLoading(true);
      const hotelRes = await fetch(`/api/hotels/${itemId}`);
      if (!hotelRes.ok) throw new Error('Hotel not found');
      const hotelData = await hotelRes.json();
      setHotel(hotelData);

      const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
      const roomData = hotelData.roomTypes?.find((r: any) => r.type === roomType) || hotelData.roomTypes?.[0];
      const pricePerNight = roomData?.price || hotelData.pricePerNight || 0;
      const subtotal = pricePerNight * nights * rooms;
      const totalPrice = parseFloat((subtotal * 1.1).toFixed(2));

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hotel', itemId, itemName: hotelData.name,
          startDate: new Date(checkIn).toISOString(), endDate: new Date(checkOut).toISOString(),
          checkInDate: new Date(checkIn).toISOString(), checkOutDate: new Date(checkOut).toISOString(),
          guests, rooms,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || 'Failed to create booking');

      setBooking({ ...bookingData, checkIn, checkOut, nights, pricePerNight, amount: totalPrice, currency: hotelData.currency || 'USD', roomType, hotelName: hotelData.name });
    } catch (e: any) {
      setError(e.message || 'Failed to initialize booking');
    } finally { setLoading(false); }
  };

  if (status === 'loading' || loading) return <Spinner label="Preparing Your Booking" />;

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '80px' }}>
      <div style={{ background: 'var(--vg-bg-card)', border: '1px solid rgba(239,68,68,0.3)', padding: '2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
          <AlertCircle size={22} />
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.75rem' }}>Booking Error</div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', marginBottom: '2rem', lineHeight: 1.7 }}>{error}</p>
        <button onClick={() => router.push(`/${locale}/hotels`)} className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Back to Hotels</button>
      </div>
    </div>
  );

  if (!booking || !hotel) return null;

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--vg-border)' }}>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: '1.2rem clamp(1.5rem,7vw,5rem)' }}>
        <Link href={`/${locale}/hotels/${itemId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-3)', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}>
          <ArrowLeft size={13} /> Back to Hotel
        </Link>
      </div>

      <div style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,7vw,5rem)', maxWidth: '900px', margin: '0 auto' }}>

        <div className="vg-overline" style={{ marginBottom: '1rem' }}>Secure Checkout</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: '2.5rem' }}>
          Complete Your <em className="vg-italic">Booking</em>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '2rem' }}
          className="booking-grid">
          <style>{`@media(max-width:800px){.booking-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Booking Summary */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '2rem' }}>
            {/* Gold top */}
            <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '1.5rem', opacity: 0.6 }} />

            <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>Booking Summary</div>

            {/* Hotel name */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 0', borderBottom: '1px solid var(--vg-border)', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-gold)', flexShrink: 0 }}>
                <MapPin size={13} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--vg-text)' }}>{hotel.name}</div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-3)' }}>
                  {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
                </div>
              </div>
            </div>

            <SummaryRow label="Check-in" value={new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
            <SummaryRow label="Check-out" value={new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
            <SummaryRow label="Duration" value={`${booking.nights} night${booking.nights !== 1 ? 's' : ''}`} />
            <SummaryRow label="Guests" value={`${guests} guest${guests !== 1 ? 's' : ''}`} />
            <SummaryRow label="Rooms" value={`${rooms} room${rooms !== 1 ? 's' : ''}`} />
            <SummaryRow label="Room Type" value={roomType} />

            {/* Price */}
            <div style={{ background: 'var(--vg-bg-surface)', padding: '1.2rem', marginTop: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>
                  {formatCurrency(booking.pricePerNight, booking.currency)} × {booking.nights}n × {rooms}rm
                </span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>
                  {formatCurrency(booking.pricePerNight * booking.nights * rooms, booking.currency)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>Service fee (10%)</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)' }}>{formatCurrency(booking.pricePerNight * booking.nights * rooms * 0.1, booking.currency)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--vg-gold-border)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-2)' }}>Total</span>
                <span className="vg-stat-num" style={{ fontSize: '1.5rem' }}>{formatCurrency(booking.amount, booking.currency)}</span>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.12em', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '1rem' }}>
              BOOKING ID: {booking.id?.slice(0, 8)?.toUpperCase()}
            </p>
          </div>

          {/* Payment */}
          <div>
            <PaymentFlow booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
