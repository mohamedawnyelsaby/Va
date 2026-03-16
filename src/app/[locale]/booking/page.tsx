// src/app/[locale]/booking/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PaymentFlow from '@/app/components/PaymentFlow';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string || 'en';
  const router = useRouter();
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const itemId    = searchParams.get('itemId');
  const itemType  = searchParams.get('itemType') || 'Hotel';
  const roomType  = searchParams.get('roomType') || 'Standard';
  const checkIn   = searchParams.get('checkIn') || '';
  const checkOut  = searchParams.get('checkOut') || '';
  const guests    = parseInt(searchParams.get('guests') || '1');
  const rooms     = parseInt(searchParams.get('rooms') || '1');

  useEffect(() => {
    if (status === 'loading') return;
    if (!itemId || !checkIn || !checkOut) {
      setError('Missing booking details. Please go back and fill in dates.');
      setLoading(false);
      return;
    }
    initBooking();
  }, [status, itemId]);

  const initBooking = async () => {
    try {
      setLoading(true);

      // 1. Get hotel info
      const hotelRes = await fetch(`/api/hotels/${itemId}`);
      if (!hotelRes.ok) throw new Error('Hotel not found');
      const hotelData = await hotelRes.json();
      setHotel(hotelData);

      // 2. Calculate price
      const nights = Math.max(1, Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const roomData = hotelData.roomTypes?.find((r: any) => r.type === roomType)
                    || hotelData.roomTypes?.[0];
      const pricePerNight = roomData?.price || hotelData.pricePerNight || 0;
      const subtotal  = pricePerNight * nights * rooms;
      const totalPrice = parseFloat((subtotal * 1.1).toFixed(2)); // +10% service fee

      // 3. Create booking in DB
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hotel',
          itemId,
          itemName: hotelData.name,
          startDate:    new Date(checkIn).toISOString(),
          endDate:      new Date(checkOut).toISOString(),
          checkInDate:  new Date(checkIn).toISOString(),
          checkOutDate: new Date(checkOut).toISOString(),
          guests,
          rooms,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || 'Failed to create booking');

      setBooking({
        ...bookingData,
        checkIn,
        checkOut,
        nights,
        pricePerNight,
        amount: totalPrice,
        currency: hotelData.currency || 'USD',
        roomType,
        hotelName: hotelData.name,
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to initialize booking');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Preparing your booking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Booking Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push(`/${locale}/hotels`)} className="w-full">
              Back to Hotels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking || !hotel) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{hotel.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">{booking.nights} night{booking.nights !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm">{guests} guest{guests !== 1 ? 's' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}</p>
              </div>

              <div className="text-sm text-muted-foreground">Room type: <span className="text-foreground font-medium">{roomType}</span></div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(booking.pricePerNight, booking.currency)} × {booking.nights} nights × {rooms} rooms
                  </span>
                  <span>{formatCurrency(booking.pricePerNight * booking.nights * rooms, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee (10%)</span>
                  <span>{formatCurrency(booking.pricePerNight * booking.nights * rooms * 0.1, booking.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(booking.amount, booking.currency)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Booking ID: {booking.id?.slice(0, 8)}...
              </p>
            </CardContent>
          </Card>

          {/* Payment */}
          <div>
            <PaymentFlow booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
