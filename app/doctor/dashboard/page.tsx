'use client';

import { useEffect, useState } from 'react';
import { StatsOverview } from '@/components/doctor/stats-overview';
import { AppointmentsList } from '@/components/doctor/appointments-list';
import { useAuthContext } from '@/components/auth-provider';
import { Appointment } from '@/types/appointment';
import { mockAppointments } from '@/data/mock-appointments';
import { mockDoctors } from '@/data/mock-doctors';

export default function DoctorDashboard() {
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load doctor's appointments
    setAppointments(mockAppointments);
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        {/* Dashboard Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, Dr. {user?.last_name}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Manage your appointments and work schedule</p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <StatsOverview 
            totalAppointments={appointments.length}
            totalPatients={doctor?.patients || 0}
            rating={doctor?.rating || 0}
            availableHours={40}
          />
        </section>

        {/* Appointments Section */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-6">
            {pendingAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Appointments</h2>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {pendingAppointments.length}
                  </span>
                </div>
                <AppointmentsList 
                  appointments={pendingAppointments}
                  onApprove={handleApproveAppointment}
                  onReject={handleRejectAppointment}
                />
              </div>
            )}

            {confirmedAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Confirmed Appointments</h2>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {confirmedAppointments.length}
                  </span>
                </div>
                <AppointmentsList 
                  appointments={confirmedAppointments}
                />
              </div>
            )}

            {pendingAppointments.length === 0 && confirmedAppointments.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Appointments</h3>
                <p className="text-gray-600 text-sm">Your appointments will appear here</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
