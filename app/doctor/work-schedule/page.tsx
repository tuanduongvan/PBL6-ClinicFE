"use client";

import { useEffect, useState } from "react";
import { scheduleApi } from "@/services/api/schedules";
import { Schedule } from "@/types/schudele";
import { WorkScheduleForm } from "@/components/doctor/work-schedule-form";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Calendar, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WorkSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchedules = async () => {
    try {
      const data = await scheduleApi.getMySchedules();
      setSchedules(data);
    } catch (error) {
      toast.error("Không thể tải danh sách lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
  };

  const handleSuccess = () => {
    fetchSchedules();
    setEditingSchedule(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsDeleting(true);
      await scheduleApi.deleteSchedule(deleteId);
      toast.success("Đã xóa lịch làm việc");
      await fetchSchedules();
    } catch (error) {
      toast.error("Xóa thất bại, vui lòng thử lại");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch làm việc</h1>
        <p className="text-muted-foreground">
          Cấu hình thời gian làm việc cố định hàng tuần.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <WorkScheduleForm 
            onSuccess={handleSuccess} 
            editingSchedule={editingSchedule}
            onCancel={handleCancelEdit}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Danh sách lịch hiện tại
            <Badge variant="outline" className="ml-2">{schedules.length}</Badge>
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-8">Đang tải dữ liệu...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground bg-muted/50">
              Chưa có lịch làm việc nào được thiết lập.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className={`relative overflow-hidden group transition-all ${editingSchedule?.id === schedule.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-lg">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {schedule.day_of_week_display}
                      </span>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
                      <Clock className="h-5 w-5" />
                      {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Tối đa: {schedule.max_patients} bệnh nhân</span>
                      <Badge variant={schedule.is_available ? "default" : "secondary"}>
                        {schedule.is_available ? "Hoạt động" : "Tạm ngưng"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Lịch làm việc này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa lịch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}