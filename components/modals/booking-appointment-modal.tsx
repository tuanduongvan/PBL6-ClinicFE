'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Doctor } from '@/types/doctor';
import { appointmentsAPI } from '@/services/api/appointments';
import { AppointmentCalendar } from '@/components/appointment-calendar';

interface BookingAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor;
  onSuccess?: (appointmentData: any) => void;
}

export function BookingAppointmentModal({ 
  isOpen, 
  onClose,
  doctor,
  onSuccess 
}: BookingAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Array<{ time: string; label: string }>>([]);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
  });

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
      setError('Vui lòng chọn ngày và giờ khám.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        doctor_id: doctor?.id,
        date: formData.date,
        time: formData.time,
        notes: formData.notes
      };

      const result = await appointmentsAPI.create(payload);
      // Appointment được tạo với status PENDING mặc định từ backend
      onSuccess?.(result);
      handleClose();

    } catch (err: any) {
      const message = err.response?.data?.detail 
        || (Array.isArray(err.response?.data) ? err.response?.data[0] : null)
        || err.response?.data?.message
        || err.message
        || "Đặt lịch thất bại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ date: '', time: '', notes: '' });
    setAvailableSlots([]);
    setSelectedSlots([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đặt Lịch Khám</DialogTitle>
          <DialogDescription>
            {doctor && `Đặt lịch với Bác sĩ ${doctor.user.first_name} ${doctor.user.last_name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor Info Mini - Cập nhật truy cập nested object */}
          {doctor && (
            <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg items-center">
              <img 
                src={doctor.user.avatar || "/placeholder-user.jpg"} 
                alt={doctor.user.first_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">
                  BS. {doctor.user.first_name} {doctor.user.last_name}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{doctor.price?.toLocaleString()} đ/lượt</span>
                  <span>•</span>
                  <span>{doctor.experience || 0} năm KN</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Chọn ngày và giờ khám</Label>
            <div className="border rounded-lg p-4 bg-card">
              <AppointmentCalendar
                doctorId={doctor?.id}
                selectedDate={formData.date}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>

          {formData.date && (
            <div className="space-y-2">
              <Label>Chọn giờ khám</Label>
              <Select 
                value={formData.time} 
                onValueChange={(value) => setFormData(prev => ({...prev, time: value}))}
                disabled={!formData.date || availableSlots.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ khám" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length > 0 ? (
                    selectedSlots.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{slot.label}</span>
                          <span className="text-muted-foreground text-xs">({slot.time.slice(0, 5)})</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Không có lịch trống</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.date && availableSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ngày này không có lịch trống. Vui lòng chọn ngày khác.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              placeholder="Triệu chứng, tiền sử bệnh..."
            />
          </div>

          <div className="text-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={isLoading || !formData.date || !formData.time} className="flex-1 ml-2">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "Xác nhận"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}