'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { DoctorCard } from '@/components/doctor-card';
import { BookingAppointmentModal } from '@/components/modals/booking-appointment-modal';
import { doctorsAPI } from '@/services/api/doctors';
import { mockDoctors } from '@/data/mock-doctors';
import type { Doctor } from '@/types/doctor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/components/auth-provider';
import router from 'next/router';

export default function DoctorsPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await doctorsAPI.getAll();
        setDoctors(data.length ? data : mockDoctors);
        if (!data.length) {
          setError('Không lấy được danh sách từ API, hiển thị dữ liệu mẫu.');
        }
      } catch (err: any) {
        setError('Không lấy được danh sách bác sĩ, hiển thị dữ liệu mẫu.');
        setDoctors(mockDoctors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || user?.role.id !== 3) {
      router.push('/');
      return;
    }
  }, [isLoggedIn, user?.role.id, router]);

  const handleBookDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    if (user?.role.id === 2) {
      window.location.href = '/doctor/dashboard';
      return;
    }

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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Danh sách bác sĩ</h1>
          <p className="text-muted-foreground">
            Chọn bác sĩ phù hợp và đặt lịch hẹn trực tiếp.
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Đang tải danh sách bác sĩ...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBooking={() => handleBookDoctor(doctor)}
              />
            ))}
          </div>
        )}
      </main>

      <BookingAppointmentModal
        isOpen={isBookingOpen && !!selectedDoctor}
        onClose={handleBookingClose}
        doctor={selectedDoctor || undefined}
        onSuccess={handleBookingSuccess}
      />

      <Footer />
    </div>
  );
}

