'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';
import { Calendar, Clock, User, X } from 'lucide-react';

interface PatientAppointmentsSectionProps {
  appointments: Appointment[];
  onCancel?: (id: string) => void;
}

export function PatientAppointmentsSection({ 
  appointments, 
  onCancel 
}: PatientAppointmentsSectionProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancel = async (appointmentId: string) => {
    setCancelingId(appointmentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    onCancel?.(appointmentId);
    setCancelingId(null);
  };

  if (appointments.length === 0) {
    return (
      <section className="py-12">
        <Card className="bg-secondary/30 border-dashed">
          <CardContent className="pt-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Appointments</h3>
            <p className="text-muted-foreground">Book your first appointment with our doctors</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Dr. Appointment</h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.dateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Duration: {appointment.duration} min
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {appointment.notes}</p>
                  )}
                </div>

                {appointment.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={cancelingId === appointment.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
