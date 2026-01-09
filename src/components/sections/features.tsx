// src/components/sections/features.tsx
'use client';

import { Globe, Shield, Zap, Brain, CreditCard, Headphones } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Full support for 50+ languages with automatic RTL detection',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Bank-level encryption with Pi Network and traditional payment options',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    icon: Zap,
    title: 'Fast Booking',
    description: 'Instant confirmations with our AI-powered booking system',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Personalized suggestions based on your preferences and behavior',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: CreditCard,
    title: 'Pi Network Integration',
    description: 'Pay with Pi cryptocurrency and earn rewards',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer service in your language',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20'
  }
];

export function FeaturesSection({ locale }: { locale: string }) {
  const { t } = useTranslation('home');

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('features.title') || 'Why Choose Va Travel?'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('features.subtitle') || 'We combine cutting-edge technology with world-class service to revolutionize your travel experience.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-lift border-0 shadow-md hover:shadow-xl transition-all">
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
