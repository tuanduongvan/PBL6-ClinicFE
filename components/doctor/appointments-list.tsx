'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';
import { Calendar, Clock, User, CheckCircle2, XCircle, Loader2, FileText, Pill } from 'lucide-react';

interface AppointmentsListProps {
  appointments: Appointment[];
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCreateRecord?: (appointment: Appointment) => void;
  onCreatePrescription?: (appointment: Appointment) => void;
  onComplete?: (id: string) => Promise<void>;
}

export function AppointmentsList({ 
  appointments, 
  onApprove, 
  onReject,
  onCreateRecord,
  onCreatePrescription,
  onComplete
}: AppointmentsListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleApprove = async (id: string) => {
    if (processingId) return; // Prevent multiple clicks
    setProcessingId(id);
    try {
      await onApprove?.(id);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return; // Prevent multiple clicks
    setProcessingId(id);
    try {
      await onReject?.(id);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to format dateTime
  const formatDateTime = (appointment: Appointment) => {
    if (appointment.dateTime) {
      const date = new Date(appointment.dateTime);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    // Fallback to date + time fields
    const dateStr = appointment.date;
    const timeStr = appointment.time;
    return {
      date: dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A',
      time: timeStr ? timeStr.slice(0, 5) : 'N/A',
    };
  };

  if (appointments.length === 0) {
    return (
      <Card className="bg-secondary/30 border-dashed">
        <CardContent className="pt-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Appointments</h3>
          <p className="text-muted-foreground">Your appointments will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {appointment.patient?.user 
                        ? `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`
                        : 'Bệnh nhân'}
                    </h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status === 'pending' ? 'Đang chờ' :
                       appointment.status === 'accepted' ? 'Đã chấp nhận' :
                       appointment.status === 'confirmed' ? 'Đã xác nhận' :
                       appointment.status === 'rejected' ? 'Đã từ chối' :
                       appointment.status === 'completed' ? 'Hoàn thành' :
                       appointment.status === 'canceled' || appointment.status === 'cancelled' ? 'Đã hủy' :
                       appointment.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm ml-11">
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
                    {appointment.duration || 30} phút
                  </div>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-muted-foreground italic ml-11">Note: {appointment.notes}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {appointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(String(appointment.id))}
                      disabled={processingId !== null}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === String(appointment.id) ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                      )}
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(String(appointment.id))}
                      disabled={processingId !== null}
                      className="text-destructive hover:text-destructive"
                    >
                      {processingId === String(appointment.id) ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Từ chối
                    </Button>
                  </div>
                )}

                {(appointment.status === 'accepted' || appointment.status === 'confirmed') && (
                  <div className="flex flex-col gap-2">
                    {onCreateRecord && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateRecord(appointment)}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Tạo hồ sơ khám
                      </Button>
                    )}
                    {onCreatePrescription && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreatePrescription(appointment)}
                        className="w-full"
                      >
                        <Pill className="w-4 h-4 mr-1" />
                        Kê đơn thuốc
                      </Button>
                    )}
                    {onComplete && (
                      <Button
                        size="sm"
                        onClick={() => onComplete(String(appointment.id))}
                        disabled={processingId !== null}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {processingId === String(appointment.id) ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                        )}
                        Hoàn thành
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
