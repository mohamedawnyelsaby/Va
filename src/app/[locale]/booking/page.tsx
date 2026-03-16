// src/app/[locale]/bookings/page.tsx — NEW FILE
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function BookingsPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings?limit=20')
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const getStatusIcon = (status: string) => {
    if (status === 'confirmed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'pending') return <Clock className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">All your travel reservations</p>
          </div>
          <Link href={`/${locale}/hotels`}>
            <Button>Find Hotels</Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring and book your first trip!</p>
              <Link href={`/${locale}/hotels`}>
                <Button size="lg">Explore Hotels</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100' : booking.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        {getStatusIcon(booking.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{booking.itemName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.checkInDate
                              ? new Date(booking.checkInDate).toLocaleDateString()
                              : new Date(booking.startDate).toLocaleDateString()}
                            {booking.checkOutDate && ` → ${new Date(booking.checkOutDate).toLocaleDateString()}`}
                          </span>
                        </div>
                        {booking.guests && (
                          <p className="text-sm text-muted-foreground mt-1">{booking.guests} guest(s){booking.rooms ? `, ${booking.rooms} room(s)` : ''}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Booking ID: {booking.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold">{formatCurrency(booking.totalPrice, booking.currency || 'USD')}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {booking.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
