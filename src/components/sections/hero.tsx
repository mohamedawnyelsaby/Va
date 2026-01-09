// src/components/sections/hero.tsx
'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export function HeroSection({ locale }: { locale: string }) {
  const { t } = useTranslation('home');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          {t('hero.title') || 'Discover the World with Va Travel'}
        </h1>
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
          {t('hero.subtitle') || 'Book hotels, attractions, and restaurants worldwide. AI-powered recommendations, Pi Network payments, and multilingual support.'}
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Destination */}
            <div className="flex-1">
              <div className="flex items-center px-4 py-3">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder') || 'Where do you want to go?'}
                  className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex-1">
              <div className="flex items-center px-4 py-3 border-l">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Check-in — Check-out"
                  className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => (e.target.type = 'text')}
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1">
              <div className="flex items-center px-4 py-3 border-l">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <select className="w-full bg-transparent outline-none text-gray-800 dark:text-white">
                  <option>2 Adults, 1 Room</option>
                  <option>1 Adult, 1 Room</option>
                  <option>2 Adults, 2 Rooms</option>
                  <option>Family (4+ people)</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <Button className="bg-pi hover:bg-pi-dark text-white px-8 py-6 rounded-xl">
              <Search className="mr-2 h-5 w-5" />
              {t('hero.searchButton') || 'Search'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">10,000+</div>
            <div className="text-white/80">Hotels Worldwide</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">50,000+</div>
            <div className="text-white/80">Tourist Attractions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">120+</div>
            <div className="text-white/80">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">₿ Pi</div>
            <div className="text-white/80">Payments Accepted</div>
          </div>
        </div>
      </div>
    </section>
  );
}
