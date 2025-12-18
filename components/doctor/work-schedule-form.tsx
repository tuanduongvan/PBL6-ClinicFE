"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { scheduleApi } from "@/services/api/schedules";
import { CreateSchedulePayload, Schedule } from "@/types/schudele";

interface WorkScheduleFormProps {
  onSuccess: () => void;
  editingSchedule?: Schedule | null; 
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Thứ Hai" }, { value: "1", label: "Thứ Ba" },
  { value: "2", label: "Thứ Tư" }, { value: "3", label: "Thứ Năm" },
  { value: "4", label: "Thứ Sáu" }, { value: "5", label: "Thứ Bảy" },
  { value: "6", label: "Chủ Nhật" },
];

export function WorkScheduleForm({ onSuccess, editingSchedule, onCancel }: WorkScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<CreateSchedulePayload | null>(null);

  const form = useForm<CreateSchedulePayload>({
    defaultValues: {
      day_of_week: 0,
      start_time: "08:00",
      end_time: "17:00",
      max_patients: 10,
      is_available: true,
    },
  });

  useEffect(() => {
    if (editingSchedule) {
      form.reset({
        day_of_week: editingSchedule.day_of_week,
        start_time: editingSchedule.start_time.slice(0, 5),
        end_time: editingSchedule.end_time.slice(0, 5),
        max_patients: editingSchedule.max_patients,
        is_available: editingSchedule.is_available,
      });
    } else {
      form.reset({
        day_of_week: 0,
        start_time: "08:00",
        end_time: "17:00",
        max_patients: 10,
        is_available: true,
      });
    }
  }, [editingSchedule, form]);

  const onSubmit = (data: CreateSchedulePayload) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingData) return;
    try {
      setLoading(true);
      const payload = { ...pendingData, day_of_week: Number(pendingData.day_of_week) };

      if (editingSchedule) {
        await scheduleApi.updateSchedule(editingSchedule.id, payload);
        toast.success("Cập nhật lịch thành công!");
      } else {
        await scheduleApi.createSchedule(payload);
        toast.success("Thêm lịch mới thành công!");
      }

      form.reset();
      setShowConfirm(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.detail 
        || (error.response?.data?.end_time ? error.response?.data?.end_time[0] : null)
        || "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-lg bg-card h-fit sticky top-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editingSchedule ? "Chỉnh sửa lịch" : "Thêm lịch mới"}
            </h3>
            {editingSchedule && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Hủy bỏ
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ trong tuần</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                     <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="start_time" render={({ field }) => (
                  <FormItem><FormLabel>Bắt đầu</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              <FormField control={form.control} name="end_time" render={({ field }) => (
                  <FormItem><FormLabel>Kết thúc</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>

            <FormField control={form.control} name="max_patients" render={({ field }) => (
                <FormItem><FormLabel>Số bệnh nhân tối đa</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )}/>

             <FormField control={form.control} name="is_available" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none"><FormLabel>Đang hoạt động</FormLabel></div>
                </FormItem>
              )}/>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang xử lý..." : (editingSchedule ? "Cập nhật thay đổi" : "Lưu lịch làm việc")}
          </Button>
        </form>
      </Form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{editingSchedule ? "Xác nhận cập nhật?" : "Xác nhận tạo lịch?"}</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {editingSchedule ? "thay đổi" : "tạo"} lịch làm việc này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}