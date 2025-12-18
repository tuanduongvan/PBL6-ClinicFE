'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Appointment } from '@/types/appointment';
import { AppointmentRecord } from '@/types/record';
import { recordsAPI } from '@/services/api/records';
import { useToast } from '@/hooks/use-toast';

interface CreateMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  existingRecord?: AppointmentRecord | null;
  onSuccess?: (record: AppointmentRecord) => void;
}

export function CreateMedicalRecordModal({ 
  isOpen, 
  onClose,
  appointment,
  existingRecord,
  onSuccess 
}: CreateMedicalRecordModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    status_before: '',
    status_after: '',
  });

  useEffect(() => {
    if (existingRecord && isOpen) {
      setFormData({
        reason: existingRecord.reason || '',
        description: existingRecord.description || '',
        status_before: existingRecord.status_before || '',
        status_after: existingRecord.status_after || '',
      });
    } else if (isOpen) {
      setFormData({
        reason: '',
        description: '',
        status_before: '',
        status_after: '',
      });
    }
  }, [existingRecord, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) {
      setError('Không tìm thấy lịch hẹn.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result: AppointmentRecord;
      if (existingRecord) {
        // Update existing record
        result = await recordsAPI.update(existingRecord.id, formData);
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật hồ sơ khám bệnh.',
        });
      } else {
        // Create new record
        result = await recordsAPI.create({
          appointment_id: appointment.id,
          ...formData,
        });
        toast({
          title: 'Thành công',
          description: 'Đã tạo hồ sơ khám bệnh.',
        });
      }
      
      onSuccess?.(result);
      handleClose();
    } catch (err: any) {
      const message = err.response?.data?.detail 
        || (Array.isArray(err.response?.data) ? err.response?.data[0] : null)
        || err.response?.data?.message
        || err.message
        || "Tạo hồ sơ thất bại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      reason: '',
      description: '',
      status_before: '',
      status_after: '',
    });
    setError('');
    onClose();
  };

  if (!appointment) return null;

  const patientName = appointment.patient?.user 
    ? `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`
    : 'Bệnh nhân';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingRecord ? 'Chỉnh sửa Hồ Sơ Khám Bệnh' : 'Tạo Hồ Sơ Khám Bệnh'}
          </DialogTitle>
          <DialogDescription>
            {existingRecord 
              ? 'Cập nhật thông tin hồ sơ khám bệnh'
              : `Tạo hồ sơ khám bệnh cho ${patientName}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do khám *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
              placeholder="Nhập lý do khám"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả / Chẩn đoán</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Mô tả tình trạng, chẩn đoán..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_before">Tình trạng trước khám</Label>
            <Textarea
              id="status_before"
              value={formData.status_before}
              onChange={(e) => setFormData(prev => ({...prev, status_before: e.target.value}))}
              placeholder="Mô tả tình trạng bệnh nhân trước khi khám..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_after">Tình trạng sau khám</Label>
            <Textarea
              id="status_after"
              value={formData.status_after}
              onChange={(e) => setFormData(prev => ({...prev, status_after: e.target.value}))}
              placeholder="Mô tả tình trạng bệnh nhân sau khi khám..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.reason} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  Đang xử lý...
                </>
              ) : (
                existingRecord ? 'Cập nhật' : 'Tạo hồ sơ'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

