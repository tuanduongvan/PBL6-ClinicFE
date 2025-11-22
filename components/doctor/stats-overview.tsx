'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';

interface StatsOverviewProps {
  totalAppointments: number;
  totalPatients: number;
  rating: number;
  availableHours: number;
}

export function StatsOverview({ 
  totalAppointments, 
  totalPatients, 
  rating, 
  availableHours 
}: StatsOverviewProps) {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Appointments',
      value: totalAppointments,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Users,
      label: 'Total Patients',
      value: totalPatients,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: 'Rating',
      value: `${rating}★`,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      icon: Clock,
      label: 'Weekly Hours',
      value: availableHours,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="text-2xl font-bold text-foreground mt-1">{stat.value}</div>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
