'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { ServicesSection } from '@/components/services-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TopDoctorsSection } from '@/components/top-doctors-section';
import { useAuthContext } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { mockDoctors } from '@/data/mock-doctors';
import { Doctor } from '@/types';

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBooking = () => {
    if (!isLoggedIn) {
      openSignIn();
    } else {
      // Redirect to patient dashboard if not a patient
      if (user?.role !== 2) {
        router.push('/patient/dashboard');
      }
    }
  };

  const handleBookDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) {
      openSignIn();
    } else if (user?.role === 2) {
      // Patient role - redirect to booking page
      router.push(`/patient/booking/${doctor.id}`);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1">
        {!isLoggedIn || user?.role !== 2 ? (
          <>
            <HeroSection 
              onBooking={handleBooking}
              isLoggedIn={isLoggedIn}
            />
            <ServicesSection />
            <TestimonialsSection />
          </>
        ) : (
          <>
            <TopDoctorsSection 
              doctors={mockDoctors}
              onBookDoctor={handleBookDoctor}
            />
            <ServicesSection />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

