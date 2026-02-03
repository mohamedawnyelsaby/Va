// src/components/sections/popular-destinations.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const destinations = [
  {
    id: 1,
    name: 'Paris, France',
    slug: 'paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    rating: 4.9,
    hotels: 1250,
    attractions: 450,
    description: 'The City of Light awaits with romantic streets and world-class cuisine',
  },
  {
    id: 2,
    name: 'Tokyo, Japan',
    slug: 'tokyo',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.8,
    hotels: 2100,
    attractions: 680,
    description: 'Experience the perfect blend of tradition and cutting-edge technology',
  },
  {
    id: 3,
    name: 'Dubai, UAE',
    slug: 'dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    rating: 4.7,
    hotels: 850,
    attractions: 320,
    description: 'Modern luxury meets Arabian hospitality in this desert oasis',
  },
  {
    id: 4,
    name: 'New York, USA',
    slug: 'new-york',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    rating: 4.8,
    hotels: 1800,
    attractions: 520,
    description: 'The city that never sleeps offers endless entertainment and culture',
  },
  {
    id: 5,
    name: 'Rome, Italy',
    slug: 'rome',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    rating: 4.9,
    hotels: 920,
    attractions: 410,
    description: 'Walk through history in the eternal city of ancient wonders',
  },
  {
    id: 6,
    name: 'Bali, Indonesia',
    slug: 'bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    rating: 4.7,
    hotels: 650,
    attractions: 280,
    description: 'Tropical paradise with pristine beaches and spiritual temples',
  },
];

export function PopularDestinations({ locale }: { locale: string }) {
  const { t } = useTranslation('home');

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Destinations
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the world's most amazing cities and create unforgettable memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading={destination.id <= 3 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{destination.hotels} Hotels</span>
                  <span>{destination.attractions} Attractions</span>
                </div>
                <Button variant="outline" className="w-full group">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="default">
            View All Destinations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
