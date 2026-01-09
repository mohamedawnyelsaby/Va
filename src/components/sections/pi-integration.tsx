// src/components/sections/pi-integration.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pi, Zap, Shield, TrendingUp } from 'lucide-react';

export function PiIntegration({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gradient-to-br from-pi/10 to-pi/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pi/20 px-4 py-2 rounded-full mb-4">
              <Pi className="h-5 w-5 text-pi" />
              <span className="text-pi font-semibold">Pi Network Integration</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Pay with Pi Network Cryptocurrency
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Be part of the future of travel payments. Use Pi cryptocurrency for bookings 
              and earn rewards with every transaction.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <Zap className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Transactions</h4>
                  <p className="text-sm text-muted-foreground">
                    Lightning-fast payments with minimal fees
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <Shield className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">
                    Blockchain-powered security for your peace of mind
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Get Pi cashback on every booking you make
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-pi hover:bg-pi-dark text-white">
              <Pi className="mr-2 h-5 w-5" />
              Connect Pi Wallet
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pi/20 to-transparent rounded-3xl blur-3xl" />
            <Card className="relative">
              <CardHeader>
                <CardTitle>Pi Rewards Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Hotel Bookings</p>
                    <p className="font-bold">2% Pi Cashback</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Attractions</p>
                    <p className="font-bold">1.5% Pi Cashback</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Write Reviews</p>
                    <p className="font-bold">+1 Pi per review</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Referrals</p>
                    <p className="font-bold">+10 Pi per friend</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// src/components/sections/testimonials.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    location: 'New York, USA',
    rating: 5,
    comment: 'Amazing platform! Found the perfect hotel in Paris with great Pi Network discounts. The AI recommendations were spot on!',
  },
  {
    name: 'Ahmed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    location: 'Dubai, UAE',
    rating: 5,
    comment: 'Love using Pi to pay for my travels. The multilingual support and customer service are exceptional.',
  },
  {
    name: 'Maria Garcia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    location: 'Barcelona, Spain',
    rating: 5,
    comment: 'Best travel platform I\'ve used. The interface is beautiful and booking is so easy. Highly recommend!',
  },
];

export function Testimonials({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied travelers who trust Va Travel for their journeys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground">{testimonial.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// src/components/sections/cta.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export function CTASection({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gradient-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of travelers exploring the world with Va Travel. 
            Sign up today and get 5 Pi bonus!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg"
              asChild
            >
              <Link href={`/${locale}/auth/signup`}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Download className="mr-2 h-5 w-5" />
              Download App
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold mb-2">120+</p>
              <p className="text-white/80">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">10K+</p>
              <p className="text-white/80">Hotels</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">50K+</p>
              <p className="text-white/80">Attractions</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">1M+</p>
              <p className="text-white/80">Happy Users</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
