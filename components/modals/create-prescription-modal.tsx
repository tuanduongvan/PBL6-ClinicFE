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
import { Treatment, TreatmentDrug, Drug, TimingType } from '@/types/treatment';
import { treatmentsAPI } from '@/services/api/treatments';
import { drugsAPI } from '@/services/api/drugs';
import { useToast } from '@/hooks/use-toast';

interface TreatmentDrugFormData {
  drug_id: number | null;
  dosage: string;
  timing: TimingType;
  minutes_before_after: number | null;
  notes: string;
}

interface TreatmentFormData {
  name: string;
  purpose: string;
  drugs: TreatmentDrugFormData[];
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
      drugs: [{
        drug_id: null,
        dosage: '',
        timing: 'anytime',
        minutes_before_after: null,
        notes: '',
      }],
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
          drugs: t.drugs && t.drugs.length > 0 
            ? t.drugs.map(d => ({
                drug_id: d.drug?.id || d.drug_id || null,
                dosage: d.dosage || '',
                timing: d.timing || 'anytime',
                minutes_before_after: d.minutes_before_after || null,
                notes: d.notes || '',
              }))
            : [{
                drug_id: null,
                dosage: '',
                timing: 'anytime' as TimingType,
                minutes_before_after: null,
                notes: '',
              }],
          repeat_days: t.repeat_days || '',
          repeat_time: t.repeat_time || '',
        })));
      } else {
        setTreatments([{
          name: '',
          purpose: '',
          drugs: [{
            drug_id: null,
            dosage: '',
            timing: 'anytime',
            minutes_before_after: null,
            notes: '',
          }],
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
      setDrugs([]);
      setFilteredDrugs([]);
    }
  };

  const addTreatment = () => {
    setTreatments([...treatments, {
      name: '',
      purpose: '',
      drugs: [{
        drug_id: null,
        dosage: '',
        timing: 'anytime',
        minutes_before_after: null,
        notes: '',
      }],
      repeat_days: '',
      repeat_time: '',
    }]);
  };

  const removeTreatment = (index: number) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const addDrugToTreatment = (treatmentIndex: number) => {
    const updated = [...treatments];
    updated[treatmentIndex].drugs.push({
      drug_id: null,
      dosage: '',
      timing: 'anytime',
      minutes_before_after: null,
      notes: '',
    });
    setTreatments(updated);
  };

  const removeDrugFromTreatment = (treatmentIndex: number, drugIndex: number) => {
    const updated = [...treatments];
    updated[treatmentIndex].drugs = updated[treatmentIndex].drugs.filter((_, i) => i !== drugIndex);
    setTreatments(updated);
  };

  const updateTreatment = (index: number, field: keyof TreatmentFormData, value: any) => {
    const updated = [...treatments];
    updated[index] = { ...updated[index], [field]: value };
    setTreatments(updated);
  };

  const updateTreatmentDrug = (
    treatmentIndex: number, 
    drugIndex: number, 
    field: keyof TreatmentDrugFormData, 
    value: any
  ) => {
    const updated = [...treatments];
    updated[treatmentIndex].drugs[drugIndex] = {
      ...updated[treatmentIndex].drugs[drugIndex],
      [field]: value
    };
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
          drugs_data: treatment.drugs.map(d => ({
            drug_id: d.drug_id,
            dosage: d.dosage,
            timing: d.timing,
            minutes_before_after: d.minutes_before_after,
            notes: d.notes || undefined,
          })),
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
      drugs: [{
        drug_id: null,
        dosage: '',
        timing: 'anytime',
        minutes_before_after: null,
        notes: '',
      }],
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

  const timingOptions = [
    { value: 'anytime', label: 'Bất kỳ lúc nào' },
    { value: 'before', label: 'Trước bữa ăn' },
    { value: 'after', label: 'Sau bữa ăn' },
    { value: 'with', label: 'Trong bữa ăn' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-6">
            {treatments.map((treatment, treatmentIndex) => (
              <div key={treatmentIndex} className="p-4 border rounded-lg space-y-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">
                    Phác đồ điều trị {treatmentIndex + 1}
                  </h4>
                  {treatments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTreatment(treatmentIndex)}
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
                      onChange={(e) => updateTreatment(treatmentIndex, 'name', e.target.value)}
                      placeholder="Ví dụ: Điều trị viêm da"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mục đích *</Label>
                    <Input
                      value={treatment.purpose}
                      onChange={(e) => updateTreatment(treatmentIndex, 'purpose', e.target.value)}
                      placeholder="Mục đích điều trị"
                      required
                    />
                  </div>
                </div>

                {/* Drugs Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Thuốc</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addDrugToTreatment(treatmentIndex)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm thuốc
                    </Button>
                  </div>

                  {treatment.drugs.map((drug, drugIndex) => (
                    <div key={drugIndex} className="p-3 border rounded-md space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Thuốc {drugIndex + 1}
                        </span>
                        {treatment.drugs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDrugFromTreatment(treatmentIndex, drugIndex)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tên thuốc</Label>
                          {drugs.length > 0 ? (
                            <Select
                              value={drug.drug_id?.toString() || 'none'}
                              onValueChange={(value) => 
                                updateTreatmentDrug(treatmentIndex, drugIndex, 'drug_id', value === 'none' ? null : parseInt(value))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thuốc" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Không chọn thuốc</SelectItem>
                                {filteredDrugs.map((d) => (
                                  <SelectItem key={d.id} value={d.id.toString()}>
                                    {d.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Nhập tên thuốc"
                              disabled
                              value="Chưa có danh sách thuốc"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Liều lượng *</Label>
                          <Input
                            value={drug.dosage}
                            onChange={(e) => updateTreatmentDrug(treatmentIndex, drugIndex, 'dosage', e.target.value)}
                            placeholder="Ví dụ: 1 viên, 500mg"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Thời gian uống</Label>
                          <Select
                            value={drug.timing}
                            onValueChange={(value) => 
                              updateTreatmentDrug(treatmentIndex, drugIndex, 'timing', value as TimingType)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {(drug.timing === 'before' || drug.timing === 'after') && (
                          <div className="space-y-2">
                            <Label>Số phút {drug.timing === 'before' ? 'trước' : 'sau'} bữa ăn</Label>
                            <Input
                              type="number"
                              min="0"
                              value={drug.minutes_before_after || ''}
                              onChange={(e) => 
                                updateTreatmentDrug(
                                  treatmentIndex, 
                                  drugIndex, 
                                  'minutes_before_after', 
                                  e.target.value ? parseInt(e.target.value) : null
                                )
                              }
                              placeholder="Ví dụ: 30"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Ghi chú</Label>
                        <Textarea
                          value={drug.notes}
                          onChange={(e) => updateTreatmentDrug(treatmentIndex, drugIndex, 'notes', e.target.value)}
                          placeholder="Ghi chú về cách uống thuốc (tùy chọn)"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Số ngày lặp lại</Label>
                    <Input
                      value={treatment.repeat_days}
                      onChange={(e) => updateTreatment(treatmentIndex, 'repeat_days', e.target.value)}
                      placeholder="Ví dụ: 7"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Giờ uống</Label>
                    <Input
                      type="time"
                      value={treatment.repeat_time}
                      onChange={(e) => updateTreatment(treatmentIndex, 'repeat_time', e.target.value)}
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
