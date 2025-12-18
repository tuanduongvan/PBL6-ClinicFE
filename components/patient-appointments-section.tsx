'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Appointment } from '@/types/appointment';
import { Calendar, Clock, User, X, Loader2 } from 'lucide-react';

interface PatientAppointmentsSectionProps {
  appointments: Appointment[];
  onCancel?: (id: string | number) => Promise<void>;
}

export function PatientAppointmentsSection({ 
  appointments, 
  onCancel 
}: PatientAppointmentsSectionProps) {
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Đã chấp nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Đang chờ';
      case 'rejected':
        return 'Đã từ chối';
      case 'completed':
        return 'Hoàn thành';
      case 'canceled':
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDateTime = (appointment: Appointment) => {
    if (appointment.dateTime) {
      const date = new Date(appointment.dateTime);
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
    }
    // Fallback to date + time fields
    const dateStr = appointment.date;
    const timeStr = appointment.time;
    return {
      date: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : 'N/A',
      time: timeStr ? timeStr.slice(0, 5) : 'N/A',
    };
  };

  // Helper function to check if appointment can be cancelled
  const canCancelAppointment = (appointment: Appointment): { canCancel: boolean; reason?: string } => {
    // Cannot cancel if already completed or canceled
    if (appointment.status === 'completed' || appointment.status === 'canceled') {
      return { canCancel: false, reason: 'Không thể hủy lịch hẹn đã hoàn thành hoặc đã hủy.' };
    }

    // Cannot cancel if rejected
    if (appointment.status === 'rejected') {
      return { canCancel: false, reason: 'Lịch hẹn đã bị từ chối, không thể hủy.' };
    }

    // Check if within 12 hours before appointment
    try {
      let appointmentDateTime: Date;
      if (appointment.dateTime) {
        appointmentDateTime = new Date(appointment.dateTime);
      } else if (appointment.date && appointment.time) {
        appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      } else {
        return { canCancel: false, reason: 'Không thể xác định thời gian lịch hẹn.' };
      }

      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilAppointment < 12) {
        return { canCancel: false, reason: 'Không thể hủy lịch hẹn trong vòng 12 giờ trước giờ khám.' };
      }

      return { canCancel: true };
    } catch (error) {
      return { canCancel: false, reason: 'Không thể xác định thời gian lịch hẹn.' };
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    const { canCancel, reason } = canCancelAppointment(appointment);
    if (!canCancel) {
      // Show error message - parent component should handle toast
      console.warn(reason);
      return;
    }
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!appointmentToCancel) return;

    setCancelingId(appointmentToCancel.id);
    setCancelDialogOpen(false);
    
    try {
      await onCancel?.(appointmentToCancel.id);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setCancelingId(null);
      setAppointmentToCancel(null);
    }
  };

  if (appointments.length === 0) {
    return (
      <section className="py-12">
        <Card className="bg-secondary/30 border-dashed">
          <CardContent className="pt-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Appointments</h3>
            <p className="text-muted-foreground">Book your first appointment with our doctors</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {appointment.doctor?.user 
                        ? `BS. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`
                        : 'Lịch hẹn'}
                    </h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(appointment).date}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(appointment).time}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Thời lượng: {appointment.duration || 30} phút
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {appointment.notes}</p>
                  )}
                </div>

                {(appointment.status === 'pending' || 
                  appointment.status === 'accepted' || 
                  appointment.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelClick(appointment)}
                    disabled={cancelingId === appointment.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {cancelingId === appointment.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Đang hủy...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Hủy lịch
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToCancel && (
                <>
                  Bạn có chắc chắn muốn hủy lịch hẹn với{' '}
                  <strong>
                    {appointmentToCancel.doctor?.user 
                      ? `BS. ${appointmentToCancel.doctor.user.first_name} ${appointmentToCancel.doctor.user.last_name}`
                      : 'bác sĩ'}
                  </strong>{' '}
                  vào {formatDateTime(appointmentToCancel).date} lúc {formatDateTime(appointmentToCancel).time}?
                  <br />
                  <br />
                  Hành động này không thể hoàn tác.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
