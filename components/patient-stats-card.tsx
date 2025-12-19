'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment } from '@/types/appointment';

interface PatientStatsCardProps {
  appointments: Appointment[];
}

export function PatientStatsCard({ appointments }: PatientStatsCardProps) {
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'accepted' || apt.status === 'confirmed' || apt.status === 'pending'
  ).length;
  const completedAppointments = appointments.filter(
    apt => apt.status === 'completed'
  ).length;
  const cancelledAppointments = appointments.filter(
    apt => apt.status === 'canceled' || apt.status === 'cancelled'
  ).length;

  const stats = [
    {
      label: 'Tổng lịch hẹn',
      value: totalAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Sắp tới',
      value: upcomingAppointments,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Đã hoàn thành',
      value: completedAppointments,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Đã hủy',
      value: cancelledAppointments,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

