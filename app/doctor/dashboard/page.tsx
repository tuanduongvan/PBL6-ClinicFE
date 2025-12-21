'use client';

import { useEffect, useState } from 'react';
import { StatsOverview } from '@/components/doctor/stats-overview';
import { AppointmentsList } from '@/components/doctor/appointments-list';
import { useAuthContext } from '@/components/auth-provider';
import { Appointment } from '@/types/appointment';
import { AppointmentRecord } from '@/types/record';
import { Treatment } from '@/types/treatment';
import { appointmentsAPI } from '@/services/api/appointments';
import { recordsAPI } from '@/services/api/records';
import { treatmentsAPI } from '@/services/api/treatments';
import { CreateMedicalRecordModal } from '@/components/modals/create-medical-record-modal';
import { CreatePrescriptionModal } from '@/components/modals/create-prescription-modal';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [existingRecord, setExistingRecord] = useState<AppointmentRecord | null>(null);
  const [existingTreatments, setExistingTreatments] = useState<Treatment[]>([]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsAPI.getMyAppointments();
      setAppointments(data);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAppointments();
  }, []);

  const handleApproveAppointment = async (id: string) => {
    try {
      const updatedAppointment = await appointmentsAPI.confirm(Number(id));
      if (updatedAppointment) {
        // Update local state
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === Number(id) ? updatedAppointment : apt
          )
        );
        toast({
          title: 'Thành công',
          description: 'Đã chấp nhận lịch hẹn.',
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message
        || 'Không thể chấp nhận lịch hẹn. Vui lòng thử lại.';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    }
  };

  const handleRejectAppointment = async (id: string) => {
    try {
      const updatedAppointment = await appointmentsAPI.reject(Number(id));
      if (updatedAppointment) {
        // Update local state
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === Number(id) ? updatedAppointment : apt
          )
        );
        toast({
          title: 'Thành công',
          description: 'Đã từ chối lịch hẹn.',
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message
        || 'Không thể từ chối lịch hẹn. Vui lòng thử lại.';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const updatedAppointment = await appointmentsAPI.complete(Number(id));
      if (updatedAppointment) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === Number(id) ? updatedAppointment : apt
          )
        );
        toast({
          title: 'Thành công',
          description: 'Đã hoàn thành lịch hẹn.',
        });
        await fetchAppointments();
      }
    } catch (error: any) {
      const message = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message
        || 'Không thể hoàn thành lịch hẹn. Vui lòng thử lại.';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    }
  };

  const handleCreateRecord = async (appointment: Appointment) => {
    // Check if record already exists
    try {
      const existing = await recordsAPI.getByAppointment(appointment.id);
      if (existing) {
        setExistingRecord(existing);
      } else {
        setExistingRecord(null);
      }
      setSelectedAppointment(appointment);
      setRecordModalOpen(true);
    } catch (error) {
      setExistingRecord(null);
      setSelectedAppointment(appointment);
      setRecordModalOpen(true);
    }
  };

  const handleCreatePrescription = async (appointment: Appointment) => {
    // Check if treatments already exist
    try {
      const existing = await treatmentsAPI.getByAppointment(appointment.id);
      setExistingTreatments(existing);
    } catch (error) {
      setExistingTreatments([]);
    }
    setSelectedAppointment(appointment);
    setPrescriptionModalOpen(true);
  };

  const handleRecordSuccess = async (record: AppointmentRecord) => {
    await fetchAppointments();
    setRecordModalOpen(false);
    setSelectedAppointment(null);
    setExistingRecord(null);
  };

  const handlePrescriptionSuccess = async (treatments: Treatment[]) => {
    await fetchAppointments();
    setPrescriptionModalOpen(false);
    setSelectedAppointment(null);
    setExistingTreatments([]);
  };

  if (!isMounted) return null;

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const acceptedAppointments = appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed');

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
            totalPatients={new Set(appointments.map(a => a.patient?.id).filter(Boolean)).size}
            rating={0}
            availableHours={40}
            appointments={appointments}
          />
        </section>

        {/* Appointments Section */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải danh sách lịch hẹn...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingAppointments.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Lịch hẹn đang chờ</h2>
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

            {acceptedAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Lịch hẹn đã chấp nhận</h2>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {acceptedAppointments.length}
                  </span>
                </div>
                <AppointmentsList 
                  appointments={acceptedAppointments}
                  onCreateRecord={handleCreateRecord}
                  onCreatePrescription={handleCreatePrescription}
                  onComplete={handleCompleteAppointment}
                />
              </div>
            )}

            {pendingAppointments.length === 0 && acceptedAppointments.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có lịch hẹn</h3>
                  <p className="text-gray-600 text-sm">Các lịch hẹn sẽ hiển thị ở đây</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <CreateMedicalRecordModal
        isOpen={recordModalOpen}
        onClose={() => {
          setRecordModalOpen(false);
          setSelectedAppointment(null);
          setExistingRecord(null);
        }}
        appointment={selectedAppointment}
        existingRecord={existingRecord}
        onSuccess={handleRecordSuccess}
      />

      <CreatePrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => {
          setPrescriptionModalOpen(false);
          setSelectedAppointment(null);
          setExistingTreatments([]);
        }}
        appointment={selectedAppointment}
        existingTreatments={existingTreatments}
        onSuccess={handlePrescriptionSuccess}
      />
    </div>
  );
}
