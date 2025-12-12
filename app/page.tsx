'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { ServicesSection } from '@/components/services-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TopDoctorsSection } from '@/components/top-doctors-section';
import { BookingAppointmentModal } from '@/components/modals/booking-appointment-modal';
import { useAuthContext } from '@/components/auth-provider';
import { mockDoctors } from '@/data/mock-doctors';
import { Doctor } from '@/types/doctor';

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Auto-redirect doctors to their dashboard
    if (isLoggedIn && user?.role.id === 2) {
      router.push('/doctor/dashboard');
    }
  }, [isLoggedIn, user?.role.id, router]);

  const handleBooking = () => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    // Doctors go to their dashboard
    if (user?.role.id === 2) {
      router.push('/doctor/dashboard');
      return;
    }

    // Patients redirect to doctors list page
    if (user?.role.id === 3) {
      router.push('/doctors');
      return;
    }
  };

  const handleBookDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    if (user?.role.id === 2) {
      window.location.href = '/doctor/dashboard';
      return;
    }

    // Patient role - open booking modal
    if (user?.role.id === 3) {
      setSelectedDoctor(doctor);
      setIsBookingOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
    setSelectedDoctor(null);
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setSelectedDoctor(null);
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
        <HeroSection 
          onBooking={handleBooking}
          isLoggedIn={isLoggedIn}
        />

        {isLoggedIn && user?.role.id === 3 ? (
          <>
            <TopDoctorsSection 
              doctors={mockDoctors}
              onBookDoctor={handleBookDoctor}
            />
            <ServicesSection />
          </>
        ) : (
          <>
            <ServicesSection />
            <TestimonialsSection />
          </>
        )}
      </main>

      <Footer />

      <BookingAppointmentModal
        isOpen={isBookingOpen}
        onClose={handleBookingClose}
        doctor={selectedDoctor || undefined}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}

