'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Clock, Ticket } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [attraction, setAttraction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/attractions/${params.id}`)
      .then(r => r.json())
      .then(d => { setAttraction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!attraction) return <div className="text-center py-20"><p>Attraction not found</p><Button onClick={() => router.back()}>Go Back</Button></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative h-96">
        <Image src={attraction.thumbnail || '/placeholder-attraction.jpg'} alt={attraction.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{attraction.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{attraction.city?.name || attraction.city}, {attraction.city?.country || attraction.country}</span></div>
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{attraction.rating?.toFixed(1)}</span></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card><CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground">{attraction.description}</p>
            </CardContent></Card>
          </div>
          <div>
            <Card><CardContent className="pt-6 space-y-4">
              {attraction.ticketPrice && <div className="flex items-center gap-2"><Ticket className="h-5 w-5" /><span className="text-2xl font-bold">{formatCurrency(attraction.ticketPrice, attraction.currency)}</span></div>}
              {attraction.duration && <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{attraction.duration}</span></div>}
              <Button className="w-full" size="lg">Book Now</Button>
            </CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
