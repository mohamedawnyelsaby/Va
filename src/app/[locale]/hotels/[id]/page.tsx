// src/app/[locale]/hotels/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Star, 
  Heart,
  Share2,
  Wifi,
  Coffee,
  Dumbbell,
  Utensils,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  });

  useEffect(() => {
    fetchHotelDetails();
  }, [params.id]);

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(`/api/hotels/${params.id}`);
      const data = await response.json();
      setHotel(data);
      if (data.roomTypes?.length > 0) {
        setSelectedRoom(data.roomTypes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hotel details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast({
        title: 'Required Fields',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to booking page with data
    const query = new URLSearchParams({
      hotelId: hotel.id,
      roomType: selectedRoom.type,
      ...bookingData,
    });
    router.push(`/booking?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Hotel Not Found</h2>
          <Button onClick={() => router.push('/hotels')}>
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Pool: Coffee,
    Gym: Dumbbell,
    Restaurant: Utensils,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-[500px] rounded-2xl overflow-hidden">
            <Image
              src={hotel.images[currentImageIndex] || hotel.thumbnail}
              alt={hotel.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Gallery Controls */}
            {hotel.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(i => (i === 0 ? hotel.images.length - 1 : i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(i => (i === hotel.images.length - 1 ? 0 : i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Hotel Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-5 w-5" />
                      <span>{hotel.city?.name}, {hotel.city?.country}</span>
                    </div>
                    <div className="flex">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-2xl">{hotel.rating?.toFixed(1)}</span>
                      <span>({hotel.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Hotel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {hotel.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotel.amenities.map((amenity: string) => {
                    const Icon = amenityIcons[amenity] || Wifi;
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card>
              <CardHeader>
                <CardTitle>Select Your Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hotel.roomTypes.map((room: any) => (
                    <div
                      key={room.type}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoom?.type === room.type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{room.type}</h4>
                          <p className="text-sm text-muted-foreground">{room.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {formatCurrency(room.price, hotel.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">per night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hotel.reviews?.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>
                            {review.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.user?.name}</p>
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(new Date(review.createdAt), 'en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {review.title && (
                            <h4 className="font-semibold mb-1">{review.title}</h4>
                          )}
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                      className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                      className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        min="1"
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                        className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rooms</label>
                    <input
                      type="number"
                      min="1"
                      value={bookingData.rooms}
                      onChange={(e) => setBookingData({ ...bookingData, rooms: parseInt(e.target.value) })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Price per night</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedRoom?.price || hotel.pricePerNight, hotel.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Service fee (10%)</span>
                    <span className="font-semibold">
                      {formatCurrency((selectedRoom?.price || hotel.pricePerNight) * 0.1, hotel.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {formatCurrency((selectedRoom?.price || hotel.pricePerNight) * 1.1, hotel.currency)}
                    </span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBooking}>
                  Book Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24 hours before check-in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
