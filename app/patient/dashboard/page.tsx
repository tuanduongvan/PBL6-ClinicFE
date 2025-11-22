'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { TopDoctorsSection } from '@/components/top-doctors-section';
import { PatientAppointmentsSection } from '@/components/patient-appointments-section';
import { ServicesSection } from '@/components/services-section';
import { useAuthContext } from '@/components/auth-provider';
import { Doctor, Appointment } from '@/types';
import { mockDoctors } from '@/data/mock-doctors';
import { mockAppointments } from '@/data/mock-appointments';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoggedIn) {
      router.push('/');
      return;
    }

    // Load top doctors
    setTopDoctors(mockDoctors);
    
    // Load patient's appointments
    setAppointments(mockAppointments);
  }, [isLoggedIn, router]);

  const handleBookDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // Navigate to booking modal or page
    router.push(`/patient/booking/${doctor.id}`);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled' as const }
          : apt
      )
    );
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
        {/* Patient Dashboard Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Welcome, {user?.firstName}! 👋
                </h1>
                <p className="text-muted-foreground mt-2">Manage your appointments and book with our top doctors</p>
              </div>
              <Button 
                onClick={() => router.push('/patient/appointments')}
                className="bg-primary hover:bg-primary/90"
              >
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Appointments Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PatientAppointmentsSection 
            appointments={appointments}
            onCancel={handleCancelAppointment}
          />
        </section>

        {/* Top Doctors Section */}
        <TopDoctorsSection 
          doctors={topDoctors}
          onBookDoctor={handleBookDoctor}
        />

        {/* Services Section */}
        <ServicesSection />
      </main>

      <Footer />
    </div>
  );
}
