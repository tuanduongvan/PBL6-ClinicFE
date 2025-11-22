'use client';

import { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Doctor } from '@/types';

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
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
    duration: '30',
  });

  // Generate available dates (next 30 days)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Generate time slots based on doctor's work schedule
  const availableTimeSlots = useMemo(() => {
    if (!formData.date) return [];
    
    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const schedule = doctor?.workSchedule?.[dayName];
    if (!schedule) return [];

    const slots = [];
    schedule.forEach(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      
      let current = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;
      
      while (current + 30 <= end) {
        const hours = Math.floor(current / 60);
        const minutes = current % 60;
        slots.push(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        );
        current += 30;
      }
    });
    
    return slots;
  }, [formData.date, doctor?.workSchedule]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      setError('Please select date and time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const appointmentData = {
        doctorId: doctor?.id,
        patientId: 'patient_id', // This would come from auth context
        dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: parseInt(formData.duration),
        notes: formData.notes,
        status: 'pending' as const,
      };

      onSuccess?.(appointmentData);
      onClose();
      setFormData({ date: '', time: '', notes: '', duration: '30' });
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {doctor && `Schedule with Dr. ${doctor.firstName} ${doctor.lastName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor Info */}
          {doctor && (
            <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
              <img 
                src={doctor.avatar || "/placeholder.svg"} 
                alt={doctor.firstName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-foreground">Dr. {doctor.firstName} {doctor.lastName}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Date
            </Label>
            <Select value={formData.date} onValueChange={(value) => handleSelectChange('date', value)}>
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="Choose appointment date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem 
                    key={date.toISOString()} 
                    value={date.toISOString().split('T')[0]}
                  >
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time
            </Label>
            <Select 
              value={formData.time} 
              onValueChange={(value) => handleSelectChange('time', value)}
              disabled={!formData.date}
            >
              <SelectTrigger disabled={isLoading || !formData.date}>
                <SelectValue placeholder={formData.date ? "Choose time slot" : "Select date first"} />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-slots" disabled>
                    No available slots for this date
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Appointment Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
              <SelectTrigger disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Describe your skin concerns or any relevant medical history..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
