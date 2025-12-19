'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Appointment } from '@/types/appointment';
import { appointmentsAPI } from '@/services/api/appointments';
import { Calendar, Clock, User, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HistoryAppointmentsPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoggedIn || user?.role.id !== 2) {
      router.push('/');
      return;
    }

    fetchAppointments();
  }, [isLoggedIn, user?.role?.id, router]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await appointmentsAPI.getMyAppointments();
      // Filter completed and confirmed appointments
      const historyAppointments = data.filter(
      apt => apt.status === 'completed' || apt.status === 'confirmed'
    );
      setAppointments(historyAppointments);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError('Không thể tải lịch sử lịch hẹn. Vui lòng thử lại.');
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lịch sử lịch hẹn.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

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
    const dateStr = appointment.date;
    const timeStr = appointment.time;
    if (dateStr && timeStr) {
      const date = new Date(`${dateStr}T${timeStr}`);
      return {
        date: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: timeStr.slice(0, 5),
      };
    }
    return { date: 'N/A', time: 'N/A' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Đã xác nhận
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Hoàn thành
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Lịch sử lịch hẹn
          </h1>
          <p className="text-muted-foreground">
            Xem tất cả các lịch hẹn đã hoàn thành và đã xác nhận
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải lịch sử lịch hẹn...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : appointments.length === 0 ? (
          <Card className="bg-card border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa có lịch sử
              </h3>
              <p className="text-muted-foreground text-sm">
                Lịch sử lịch hẹn của bạn sẽ hiển thị ở đây
              </p>
              </CardContent>
            </Card>
          ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment);
              const patient = appointment.patient;
              const patientName = patient?.user
                ? `${patient.user.first_name} ${patient.user.last_name}`
                : 'Bệnh nhân';

              return (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {patientName}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Ngày:</span>
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Giờ:</span>
                            <span>{time}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Ghi chú:</span>{' '}
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}

