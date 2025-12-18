'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Appointment } from '@/types/appointment';
import { Treatment, Drug } from '@/types/treatment';
import { treatmentsAPI } from '@/services/api/treatments';
import { drugsAPI } from '@/services/api/drugs';
import { useToast } from '@/hooks/use-toast';

interface TreatmentFormData {
  name: string;
  purpose: string;
  drug_id: number | null;
  dosage: string;
  repeat_days: string;
  repeat_time: string;
}

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  existingTreatments?: Treatment[];
  onSuccess?: (treatments: Treatment[]) => void;
}

export function CreatePrescriptionModal({ 
  isOpen, 
  onClose,
  appointment,
  existingTreatments = [],
  onSuccess 
}: CreatePrescriptionModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);

  const [treatments, setTreatments] = useState<TreatmentFormData[]>([
    {
      name: '',
      purpose: '',
      drug_id: null,
      dosage: '',
      repeat_days: '',
      repeat_time: '',
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchDrugs();
      if (existingTreatments.length > 0) {
        setTreatments(existingTreatments.map(t => ({
          name: t.name,
          purpose: t.purpose,
          drug_id: t.drug?.id || null,
          dosage: t.dosage || '',
          repeat_days: t.repeat_days || '',
          repeat_time: t.repeat_time || '',
        })));
      } else {
        setTreatments([{
          name: '',
          purpose: '',
          drug_id: null,
          dosage: '',
          repeat_days: '',
          repeat_time: '',
        }]);
      }
    }
  }, [isOpen, existingTreatments]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = drugs.filter(drug =>
        drug.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDrugs(filtered);
    } else {
      setFilteredDrugs(drugs);
    }
  }, [searchQuery, drugs]);

  const fetchDrugs = async () => {
    try {
      const data = await drugsAPI.getAll();
      setDrugs(data);
      setFilteredDrugs(data);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      // If drugs API is not available, allow manual input
      setDrugs([]);
      setFilteredDrugs([]);
    }
  };

  const addTreatment = () => {
    setTreatments([...treatments, {
      name: '',
      purpose: '',
      drug_id: null,
      dosage: '',
      repeat_days: '',
      repeat_time: '',
    }]);
  };

  const removeTreatment = (index: number) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const updateTreatment = (index: number, field: keyof TreatmentFormData, value: any) => {
    const updated = [...treatments];
    updated[index] = { ...updated[index], [field]: value };
    setTreatments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) {
      setError('Không tìm thấy lịch hẹn.');
      return;
    }

    // Validate
    const hasEmpty = treatments.some(t => !t.name || !t.purpose);
    if (hasEmpty) {
      setError('Vui lòng điền đầy đủ thông tin cho tất cả các phác đồ điều trị.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const createdTreatments: Treatment[] = [];
      
      // Create all treatments
      for (const treatment of treatments) {
        const result = await treatmentsAPI.create({
          appointment_id: appointment.id,
          name: treatment.name,
          purpose: treatment.purpose,
          drug_id: treatment.drug_id,
          dosage: treatment.dosage || undefined,
          repeat_days: treatment.repeat_days || undefined,
          repeat_time: treatment.repeat_time || undefined,
        });
        createdTreatments.push(result);
      }

      toast({
        title: 'Thành công',
        description: `Đã tạo ${createdTreatments.length} phác đồ điều trị.`,
      });
      
      onSuccess?.(createdTreatments);
      handleClose();
    } catch (err: any) {
      const message = err.response?.data?.detail 
        || (Array.isArray(err.response?.data) ? err.response?.data[0] : null)
        || err.response?.data?.message
        || err.message
        || "Tạo đơn thuốc thất bại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTreatments([{
      name: '',
      purpose: '',
      drug_id: null,
      dosage: '',
      repeat_days: '',
      repeat_time: '',
    }]);
    setError('');
    setSearchQuery('');
    onClose();
  };

  if (!appointment) return null;

  const patientName = appointment.patient?.user 
    ? `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`
    : 'Bệnh nhân';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Đơn Thuốc</DialogTitle>
          <DialogDescription>
            Kê đơn thuốc cho {patientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {treatments.map((treatment, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">
                    Phác đồ điều trị {index + 1}
                  </h4>
                  {treatments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTreatment(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tên phác đồ điều trị *</Label>
                    <Input
                      value={treatment.name}
                      onChange={(e) => updateTreatment(index, 'name', e.target.value)}
                      placeholder="Ví dụ: Điều trị viêm da"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mục đích *</Label>
                    <Input
                      value={treatment.purpose}
                      onChange={(e) => updateTreatment(index, 'purpose', e.target.value)}
                      placeholder="Mục đích điều trị"
                      required
                    />
                  </div>
                </div>

                {drugs.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Tìm kiếm thuốc</Label>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm thuốc..."
                    />
                    <Select
                      value={treatment.drug_id?.toString() || ''}
                      onValueChange={(value) => updateTreatment(index, 'drug_id', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thuốc (tùy chọn)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Không chọn thuốc</SelectItem>
                        {filteredDrugs.map((drug) => (
                          <SelectItem key={drug.id} value={drug.id.toString()}>
                            {drug.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Tên thuốc (tùy chọn)</Label>
                    <Input
                      value={treatment.drug_id ? drugs.find(d => d.id === treatment.drug_id)?.name || '' : ''}
                      onChange={(e) => {
                        // For now, just store as text in purpose or create a custom field
                        // This is a workaround until drugs API is available
                      }}
                      placeholder="Nhập tên thuốc (nếu có)"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Tính năng chọn thuốc sẽ được bổ sung sau khi API drugs được triển khai
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Liều lượng</Label>
                    <Input
                      value={treatment.dosage}
                      onChange={(e) => updateTreatment(index, 'dosage', e.target.value)}
                      placeholder="Ví dụ: 1 viên"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Số ngày lặp lại</Label>
                    <Input
                      value={treatment.repeat_days}
                      onChange={(e) => updateTreatment(index, 'repeat_days', e.target.value)}
                      placeholder="Ví dụ: 7"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Giờ uống</Label>
                    <Input
                      type="time"
                      value={treatment.repeat_time}
                      onChange={(e) => updateTreatment(index, 'repeat_time', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addTreatment}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm phác đồ điều trị
          </Button>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4"/>
                  Đang xử lý...
                </>
              ) : (
                'Tạo đơn thuốc'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

