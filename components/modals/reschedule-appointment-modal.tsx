'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Appointment } from '@/types/appointment';
import { appointmentsAPI } from '@/services/api/appointments';
import { AppointmentCalendar } from '@/components/appointment-calendar';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess?: (appointment: Appointment) => void;
}

export function RescheduleAppointmentModal({ 
  isOpen, 
  onClose,
  appointment,
  onSuccess 
}: RescheduleAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Array<{ time: string; label: string }>>([]);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
  });

  useEffect(() => {
    if (appointment && isOpen) {
      // Reset form when modal opens
      setFormData({ date: '', time: '' });
      setAvailableSlots([]);
      setSelectedSlots([]);
      setError('');
    }
  }, [appointment, isOpen]);

  // Handler khi chọn ngày từ calendar
  const handleDateSelect = (date: string, slots: Array<{ time: string; label: string }>) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    setSelectedSlots(slots);
    setAvailableSlots(slots.map(s => s.time));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setError('Vui lòng chọn ngày và giờ khám mới.');
      return;
    }

    if (!appointment) {
      setError('Không tìm thấy lịch hẹn.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await appointmentsAPI.reschedule(appointment.id, {
        date: formData.date,
        time: formData.time,
      });
      
      onSuccess?.(result!);
      handleClose();
    } catch (err: any) {
      const message = err.response?.data?.detail 
        || (Array.isArray(err.response?.data) ? err.response?.data[0] : null)
        || err.response?.data?.message
        || err.message
        || "Đổi lịch thất bại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ date: '', time: '' });
    setAvailableSlots([]);
    setSelectedSlots([]);
    setError('');
    onClose();
  };

  if (!appointment) return null;

  const formatDateTime = (appointment: Appointment) => {
    if (appointment.dateTime) {
      const date = new Date(appointment.dateTime);
      return {
        date: date.toLocaleDateString('vi-VN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
    }
    return {
      date: appointment.date ? new Date(appointment.date).toLocaleDateString('vi-VN') : 'N/A',
      time: appointment.time ? appointment.time.slice(0, 5) : 'N/A',
    };
  };

  const { date, time } = formatDateTime(appointment);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đổi Lịch Hẹn</DialogTitle>
          <DialogDescription>
            Đổi lịch hẹn hiện tại sang thời gian mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Appointment Info */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
            <h4 className="font-semibold text-foreground">Lịch hẹn hiện tại:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
              </div>
              {appointment.doctor?.user && (
                <div>
                  <span className="font-medium">Bác sĩ: </span>
                  BS. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chọn ngày và giờ khám mới</Label>
            <div className="border rounded-lg p-4 bg-card">
              <AppointmentCalendar
                doctorId={appointment.doctor?.id}
                selectedDate={formData.date}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>

          {formData.date && (
            <div className="space-y-2">
              <Label>Chọn giờ khám mới</Label>
              <select
                value={formData.time}
                onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                disabled={!formData.date || availableSlots.length === 0}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Chọn giờ khám</option>
                {selectedSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {slot.label} ({slot.time.slice(0, 5)})
                  </option>
                ))}
              </select>
              {formData.date && availableSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ngày này không có lịch trống. Vui lòng chọn ngày khác.
                </p>
              )}
            </div>
          )}

          <div className="text-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.date || !formData.time} 
              className="flex-1 ml-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đổi lịch"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

