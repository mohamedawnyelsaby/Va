// src/app/[locale]/bookings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Pending'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Confirmed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 bg-red-100',
    label: 'Cancelled'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-100',
    label: 'Completed'
  }
};

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, currentPage, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) throw new Error('Cancel failed');

      toast({
        title: 'Success',
        description: 'Booking cancelled successfully',
      });

      fetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage and track all your travel reservations
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or booking code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Try adjusting your search' : 'Start planning your next adventure!'}
                </p>
                <Button asChild>
                  <Link href="/hotels">Explore Hotels</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig]?.icon || Clock;
              const statusColor = statusConfig[booking.status as keyof typeof statusConfig]?.color || '';
              
              return (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              {booking.itemName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Booking Code: {booking.bookingCode}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusColor}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium capitalize">
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Check-in</p>
                              <p className="font-medium">
                                {formatDate(new Date(booking.startDate), 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          {booking.endDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Check-out</p>
                                <p className="font-medium">
                                  {formatDate(new Date(booking.endDate), 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.guests && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Guests</p>
                                <p className="font-medium">
                                  {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex flex-col justify-between items-end min-w-[200px]">
                        <div className="text-right mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(booking.totalPrice, booking.currency)}
                          </p>
                          {booking.piAmount && (
                            <p className="text-sm text-pi">
                              π {booking.piAmount.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
