// src/components/sections/how-it-works.tsx

'use client';

import { Search, CheckCircle, Plane, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const steps = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse thousands of hotels, attractions, and restaurants worldwide with our AI-powered search',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    number: '01',
  },
  {
    icon: CheckCircle,
    title: 'Compare & Book',
    description: 'Compare prices, read reviews, and book instantly with our secure payment system',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    number: '02',
  },
  {
    icon: Plane,
    title: 'Travel & Enjoy',
    description: 'Pack your bags and enjoy your trip with our 24/7 customer support and travel assistance',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    number: '03',
  },
  {
    icon: Star,
    title: 'Share & Earn',
    description: 'Share your experience, write reviews, and earn Pi rewards for every contribution',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    number: '04',
  },
];

export function HowItWorks({ locale }: { locale: string }) {
  const { t } = useTranslation('home');

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('howItWorks.title') || 'How It Works'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('howItWorks.subtitle') || 'Start your journey in 4 simple steps'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 to-yellow-500 opacity-20" />

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-full ${step.bg} mb-4`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">Hotels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Attractions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">120+</div>
            <div className="text-gray-600 dark:text-gray-400">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-gray-600 dark:text-gray-400">Happy Travelers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
