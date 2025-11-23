'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkSchedule } from '@/types/schudele';
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WorkScheduleFormProps {
  currentSchedule?: WorkSchedule;
  onSubmit?: (schedule: WorkSchedule) => void;
}

export function WorkScheduleForm({ currentSchedule, onSubmit }: WorkScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<WorkSchedule>(
    currentSchedule || {
      'Monday': [{ startTime: '09:00', endTime: '17:00', isAvailable: true }],
      'Tuesday': [{ startTime: '09:00', endTime: '17:00', isAvailable: true }],
      'Wednesday': [{ startTime: '09:00', endTime: '17:00', isAvailable: true }],
      'Thursday': [{ startTime: '09:00', endTime: '17:00', isAvailable: true }],
      'Friday': [{ startTime: '09:00', endTime: '14:00', isAvailable: true }],
      'Saturday': [],
      'Sunday': [],
    }
  );

  const handleTimeChange = (day: string, index: number, field: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
    setError('');
  };

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].length === 0
        ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }]
        : [],
    }));
  };

  const handleAddSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { startTime: '17:00', endTime: '18:00', isAvailable: true }],
    }));
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate times
      for (const day in schedule) {
        for (const slot of schedule[day]) {
          if (slot.startTime >= slot.endTime) {
            setError(`Invalid time for ${day}: Start time must be before end time`);
            setIsLoading(false);
            return;
          }
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit?.(schedule);
    } catch (err: any) {
      setError(err.message || 'Failed to update schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Schedule</CardTitle>
        <CardDescription>Set your available working hours for each day</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {DAYS.map(day => (
            <div key={day} className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={day}
                  checked={schedule[day].length > 0}
                  onCheckedChange={() => handleDayToggle(day)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor={day}
                  className="font-semibold text-foreground cursor-pointer"
                >
                  {day}
                </Label>
              </div>

              {schedule[day].length > 0 && (
                <div className="space-y-2 ml-6">
                  {schedule[day].map((slot, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Time</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">End Time</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {schedule[day].length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(day, index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSlot(day)}
                    disabled={isLoading}
                    className="text-primary"
                  >
                    + Add Time Slot
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
