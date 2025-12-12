'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkScheduleForm } from '@/components/doctor/work-schedule-form';
import { WorkSchedule } from '@/types/schudele';
import { mockDoctors } from '@/data/mock-doctors';
import { Calendar, Clock } from 'lucide-react';

export default function WorkSchedulePage() {
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load doctor's work schedule
    const doctor = mockDoctors[0]; // Mock: get first doctor
    setWorkSchedule(doctor.workSchedule);
  }, []);

  const handleScheduleSubmit = (schedule: WorkSchedule) => {
    setWorkSchedule(schedule);
    setShowRegisterForm(false);
    // Here you would call the API to save the schedule
  };

  if (!isMounted) return null;

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Work Schedule</h1>
              <p className="text-gray-600 text-sm">View and manage your weekly work schedule</p>
            </div>
            <Button 
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              {showRegisterForm ? 'Cancel' : 'Register Schedule'}
            </Button>
          </div>

          {showRegisterForm ? (
            <div className="transition-opacity duration-200">
              <WorkScheduleForm 
                currentSchedule={workSchedule || undefined}
                onSubmit={handleScheduleSubmit}
              />
            </div>
          ) : (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Current Schedule</CardTitle>
                <CardDescription className="text-sm text-gray-600">Your weekly work schedule</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {workSchedule ? (
                  <div className="space-y-4">
                    {DAYS.map((day) => {
                      const slots = workSchedule[day] || [];
                      return (
                        <div key={day} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <h3 className="font-medium text-gray-900">{day}</h3>
                          </div>
                          {slots.length > 0 ? (
                            <div className="ml-6 space-y-2">
                              {slots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  {slot.isAvailable && (
                                    <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                      Available
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="ml-6 text-gray-500 text-sm italic">No schedule for this day</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No schedule registered yet</h3>
                    <p className="text-gray-600 text-sm">Click "Register Schedule" to set up your work hours.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

