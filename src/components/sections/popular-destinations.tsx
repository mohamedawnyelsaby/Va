// src/components/sections/popular-destinations.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  thumbnail: string;
  images: string[];
  isPopular: boolean;
}

interface CityStats {
  hotels: number;
  attractions: number;
  rating: number;
}

export function PopularDestinations({ locale }: { locale: string }) {
  const { t } = useTranslation('home');
  const [cities, setCities] = useState<City[]>([]);
  const [stats, setStats] = useState<Record<string, CityStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoading(true);
        setError(null);

        // Fetch cities
        const citiesResponse = await fetch('/api/cities?popular=true');
        
        if (!citiesResponse.ok) {
          throw new Error('Failed to fetch cities');
        }

        const citiesData = await citiesResponse.json();
        setCities(citiesData.cities || []);

        // Fetch stats for each city
        const statsData: Record<string, CityStats> = {};
        for (const city of citiesData.cities || []) {
          try {
            const hotelsRes = await fetch(`/api/hotels?cityId=${city.id}`);
            const hotelsData = await hotelsRes.json();
            
            statsData[city.id] = {
              hotels: hotelsData.hotels?.length || 0,
              attractions: Math.floor(Math.random() * 500) + 200, // Placeholder until attractions API is ready
              rating: 4.5 + Math.random() * 0.5, // Placeholder
            };
          } catch (err) {
            console.error(`Error fetching stats for ${city.name}:`, err);
            statsData[city.id] = {
              hotels: 0,
              attractions: 0,
              rating: 4.5,
            };
          }
        }
        setStats(statsData);

      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-t-lg"></div>
                  <div className="bg-gray-100 p-6 rounded-b-lg">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('destinations.title') || 'Popular Destinations'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('destinations.subtitle') || 'Explore the world\'s most amazing cities and create unforgettable memories'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cities.map((city, index) => {
            const cityStats = stats[city.id] || { hotels: 0, attractions: 0, rating: 4.5 };
            
            return (
              <Card key={city.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={city.thumbnail || city.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading={index <= 2 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <h3 className="text-xl font-bold">{city.name}, {city.country}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{cityStats.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {city.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{cityStats.hotels} Hotels</span>
                    <span>{cityStats.attractions} Attractions</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full group"
                    onClick={() => window.location.href = `/${locale}/cities/${city.slug}`}
                  >
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="default"
            onClick={() => window.location.href = `/${locale}/cities`}
          >
            View All Destinations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
