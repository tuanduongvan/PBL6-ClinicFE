'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Star, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment } from '@/types/appointment';

interface StatsOverviewProps {
  totalAppointments: number;
  totalPatients: number;
  rating: number;
  availableHours: number;
  appointments?: Appointment[];
}

export function StatsOverview({ 
  totalAppointments, 
  totalPatients, 
  rating, 
  availableHours,
  appointments = [],
}: StatsOverviewProps) {
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const acceptedCount = appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const rejectedCount = appointments.filter(a => a.status === 'rejected').length;

  const stats = [
    {
      title: 'Tổng lịch hẹn',
      value: totalAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Tổng bệnh nhân',
      value: totalPatients,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Đánh giá',
      value: rating > 0 ? `${rating.toFixed(1)}★` : 'N/A',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Giờ làm việc',
      value: `${availableHours}h`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  const statusStats = [
    {
      title: 'Đang chờ',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Đã chấp nhận',
      value: acceptedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Hoàn thành',
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Từ chối',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {appointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Thống kê theo trạng thái</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
                    <CardTitle className="text-xl font-bold">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        );
      })}
          </div>
        </div>
      )}
    </div>
  );
}
