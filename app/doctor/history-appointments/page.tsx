'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/types/appointment';
import { mockAppointments } from '@/data/mock-appointments';
import { Calendar, Clock, User } from 'lucide-react';

export default function HistoryAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load completed appointments (history)
    const completedAppointments = mockAppointments.filter(
      apt => apt.status === 'completed' || apt.status === 'confirmed'
    );
    setAppointments(completedAppointments);
  }, []);

  if (!isMounted) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">History Appointments</h1>
            <p className="text-gray-600 text-sm">View all your past appointments</p>
          </div>

          {appointments.length === 0 ? (
            <Card className="bg-white border-dashed border-gray-300 shadow-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No History</h3>
                <p className="text-gray-600 text-sm">Your appointment history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-white hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1.5">Patient Appointment</h3>
                            <Badge className={`${getStatusColor(appointment.status)} text-xs px-2 py-0.5`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Date:</span>
                            <span>
                              {new Date(appointment.dateTime).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Time:</span>
                            <span>
                              {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

