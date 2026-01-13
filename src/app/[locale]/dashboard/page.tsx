// src/app/[locale]/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  Wallet, 
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Pi
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      setUserData(session.user);
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [userRes, bookingsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/bookings?limit=5'),
      ]);

      const user = await userRes.json();
      const bookingsData = await bookingsRes.json();

      setUserData(user);
      setRecentBookings(bookingsData.bookings || []);
      
      setStats({
        totalBookings: user._count.bookings,
        totalReviews: user._count.reviews,
        favorites: user._count.favorites,
        piBalance: user.piBalance,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData?.avatar} />
              <AvatarFallback>
                {userData?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {userData?.name || 'Traveler'}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your travels
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime bookings
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reviews Written
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Helping others decide
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Favorites
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.favorites || 0}</div>
              <p className="text-xs text-muted-foreground">
                Places you love
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-pi/20 bg-gradient-to-br from-pi/5 to-pi/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pi Balance
              </CardTitle>
              <Pi className="h-4 w-4 text-pi" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pi">
                π {stats?.piBalance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to spend
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your latest travel reservations
                  </CardDescription>
                </div>
                <Link href="/bookings">
                  <Button variant="outline">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <Link href="/hotels">
                    <Button className="mt-4">Start Exploring</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status === 'confirmed' ? <CheckCircle className="h-5 w-5" /> :
                           booking.status === 'pending' ? <Clock className="h-5 w-5" /> :
                           <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{booking.itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                What would you like to do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/hotels">
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Hotels
                </Button>
              </Link>
              <Link href="/attractions">
                <Button className="w-full justify-start" variant="outline">
                  <Star className="mr-2 h-4 w-4" />
                  Explore Attractions
                </Button>
              </Link>
              <Link href="/bookings">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Bookings
                </Button>
              </Link>
              <Link href="/profile">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
              <Button className="w-full justify-start bg-pi hover:bg-pi-dark text-white">
                <Wallet className="mr-2 h-4 w-4" />
                Top Up Pi Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
