'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { StatsOverview } from '@/components/doctor/stats-overview';
import { WorkScheduleForm } from '@/components/doctor/work-schedule-form';
import { AppointmentsList } from '@/components/doctor/appointments-list';
import { useAuthContext } from '@/components/auth-provider';
import { Appointment, WorkSchedule } from '@/types';
import { mockAppointments } from '@/data/mock-appointments';
import { mockDoctors } from '@/data/mock-doctors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (!isLoggedIn || user?.role !== 1) {
      router.push('/');
      return;
    }

    // Load doctor's appointments
    setAppointments(mockAppointments);

    // Load doctor's work schedule
    const doctor = mockDoctors[0]; // Mock: get first doctor
    setWorkSchedule(doctor.workSchedule);
  }, [isLoggedIn, user?.role, router]);

  const handleScheduleSubmit = (schedule: WorkSchedule) => {
    setWorkSchedule(schedule);
    // Here you would call the API to save the schedule
  };

  const handleApproveAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
      )
    );
  };

  const handleRejectAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      )
    );
  };

  if (!isMounted) return null;

  const doctor = mockDoctors[0];
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

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
        {/* Dashboard Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Welcome, Dr. {user?.lastName}! 👨‍⚕️
            </h1>
            <p className="text-muted-foreground mt-2">Manage your appointments and work schedule</p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsOverview 
            totalAppointments={appointments.length}
            totalPatients={doctor?.patients || 0}
            rating={doctor?.rating || 0}
            availableHours={40}
          />
        </section>

        {/* Dashboard Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit">
              <TabsTrigger value="appointments">
                Appointments ({pendingAppointments.length} pending)
              </TabsTrigger>
              <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Pending Appointments</h2>
                <AppointmentsList 
                  appointments={pendingAppointments}
                  onApprove={handleApproveAppointment}
                  onReject={handleRejectAppointment}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Confirmed Appointments</h2>
                <AppointmentsList 
                  appointments={confirmedAppointments}
                />
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-6">
              {workSchedule && (
                <WorkScheduleForm 
                  currentSchedule={workSchedule}
                  onSubmit={handleScheduleSubmit}
                />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}
