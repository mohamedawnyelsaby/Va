// src/components/sections/testimonials.tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TestimonialsProps {
  locale: string;
}

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Travel Enthusiast',
    avatar: '/avatars/sarah.jpg',
    fallback: 'SJ',
    rating: 5,
    text: 'Amazing experience! The AI assistant helped me plan the perfect trip to Egypt. Everything was seamless.',
  },
  {
    id: 2,
    name: 'Awny',
    role: 'Business Traveler',
    avatar: '/avatars/ahmed.jpg',
    fallback: 'aw',
    rating: 5,
    text: 'Professional service and great prices. The virtual assistant made booking so easy and quick.',
  },
  {
    id: 3,
    name: 'Maria Garcia',
    role: 'Family Vacation',
    avatar: '/avatars/maria.jpg',
    fallback: 'MG',
    rating: 5,
    text: 'Wonderful family vacation! The personalized recommendations were spot on. Highly recommend!',
  },
];

export function Testimonials({ locale }: TestimonialsProps) {

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real experiences from travelers who used our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={cn(
                'bg-card rounded-lg p-6 shadow-lg',
                'border border-border/50',
                'hover:shadow-xl transition-shadow duration-300'
              )}
            >
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.fallback}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-500 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
