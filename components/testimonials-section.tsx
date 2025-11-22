'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alice Johnson',
      role: 'Patient',
      text: 'Outstanding service! Dr. Smith helped clear my acne in just 3 months. Highly recommended!',
      rating: 5,
      avatar: '/placeholder.svg?key=a1j2k3',
    },
    {
      name: 'Michael Chen',
      role: 'Patient',
      text: 'Professional and caring doctors. The entire experience was smooth and pleasant.',
      rating: 5,
      avatar: '/placeholder.svg?key=m4c5h6',
    },
    {
      name: 'Sarah Williams',
      role: 'Patient',
      text: 'Best dermatology clinic I have visited. Their anti-aging treatment is amazing!',
      rating: 5,
      avatar: '/placeholder.svg?key=s7w8i9',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from our satisfied patients
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
            >
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 fill-accent text-accent" 
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar || "/placeholder.svg"} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
