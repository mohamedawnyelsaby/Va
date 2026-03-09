'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Hotel, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CitiesPage() {
  const { locale } = useParams();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => { setCities(Array.isArray(d) ? d : d.cities || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">All Cities</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">Browse all available destinations</p>
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No cities found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city: any) => (
              <Link key={city.id} href={`/${locale}/hotels?city=${city.name}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={city.thumbnail || city.images?.[0] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600'}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h2 className="text-2xl font-bold">{city.name}</h2>
                      <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{city.country}</div>
                    </div>
                  </div>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1"><Hotel className="h-4 w-4" /><span>{city._count?.hotels || 0} Hotels</span></div>
                      {city.rating && <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{city.rating}</span></div>}
                    </div>
                    {city.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{city.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
