'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { TopDoctorsSection } from '@/components/top-doctors-section';
import { PatientAppointmentsSection } from '@/components/patient-appointments-section';
import { ServicesSection } from '@/components/services-section';
import { BookingAppointmentModal } from '@/components/modals/booking-appointment-modal';
import { useAuthContext } from '@/components/auth-provider';
import { Doctor } from '@/types/doctor';
import { Appointment } from '@/types/appointment'
import { appointmentsAPI } from '@/services/api/appointments';
import { notificationsAPI, Notification } from '@/services/api/notifications';
import { doctorsApi } from '@/services/api/doctors';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const NOTIFICATION_POLL_INTERVAL = 5000; // 5 seconds

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const { toast } = useToast();
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const readNotificationIds = useRef<Set<number>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsAPI.getMyAppointments();
      setAppointments(data);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchTopDoctors = async () => {
    try {
      const data = await doctorsApi.getTopDoctors(6);
      setTopDoctors(data);
    } catch (error) {
      console.error('Error fetching top doctors:', error);
    }
  };

  const checkNotifications = async () => {
    try {
      const notifications = await notificationsAPI.getMyNotifications();
      const unreadNotifications = notifications.filter(
        n => !n.is_read && !readNotificationIds.current.has(n.id)
      );

      for (const notification of unreadNotifications) {
        readNotificationIds.current.add(notification.id);
        
        // Show toast based on notification type
        if (notification.type === 'appointment_confirmed') {
          toast({
            title: 'Thành công',
            description: notification.message || 'Lịch hẹn của bạn đã được bác sĩ xác nhận.',
          });
          // Refresh appointments
          await fetchAppointments();
        } else if (notification.type === 'appointment_rejected') {
          toast({
            variant: 'destructive',
            title: 'Thông báo',
            description: notification.message || 'Lịch hẹn của bạn không được chấp nhận, vui lòng chọn ca khác.',
          });
          // Refresh appointments
          await fetchAppointments();
        } else {
          // Other notification types
          toast({
            title: 'Thông báo',
            description: notification.message,
          });
        }

        // Mark as read
        await notificationsAPI.markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoggedIn || user?.role.id !== 3) {
      router.push('/');
      return;
    }

    // Initial load
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAppointments(), fetchTopDoctors()]);
      setIsLoading(false);
    };

    loadData();

    // Start polling for notifications
    pollingIntervalRef.current = setInterval(checkNotifications, NOTIFICATION_POLL_INTERVAL);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isLoggedIn, user?.role?.id, router]);

  const handleBookDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingOpen(true);
  };

  const handleCancelAppointment = async (appointmentId: string | number) => {
    try {
      const success = await appointmentsAPI.cancel(Number(appointmentId));
      if (success) {
        await fetchAppointments();
        toast({
          title: 'Thành công',
          description: 'Đã hủy lịch hẹn thành công.',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message
        || 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
      
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: errorMessage,
      });
    }
  };

  const handleBookingSuccess = async (appointmentData: Appointment) => {
    setIsBookingOpen(false);
    setSelectedDoctor(null);
    // Refresh appointments to show the new one
    await fetchAppointments();
    toast({
      title: 'Thành công',
      description: 'Đã đặt lịch hẹn thành công. Lịch hẹn đang chờ bác sĩ xác nhận.',
    });
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
        {/* Patient Dashboard Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Welcome, {user?.first_name}! 👋
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải danh sách lịch hẹn...</p>
            </div>
          ) : (
            <PatientAppointmentsSection 
              appointments={appointments}
              onCancel={handleCancelAppointment}
            />
          )}
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

      <BookingAppointmentModal
        isOpen={isBookingOpen && !!selectedDoctor}
        onClose={handleBookingClose}
        doctor={selectedDoctor || undefined}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
