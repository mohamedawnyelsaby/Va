// src/components/sections/testimonials.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    location: 'New York, USA',
    rating: 5,
    comment: 'Amazing platform! Found the perfect hotel in Paris with great Pi Network discounts.',
  },
  {
    name: 'Ahmed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    location: 'Dubai, UAE',
    rating: 5,
    comment: 'Love using Pi to pay for my travels. The multilingual support is exceptional.',
  },
  {
    name: 'Maria Garcia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    location: 'Barcelona, Spain',
    rating: 5,
    comment: 'Best travel platform I have used. The interface is beautiful and booking is easy.',
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
            Join thousands of satisfied travelers who trust Va Travel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
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
