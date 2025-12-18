'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentsAPI } from '@/services/api/appointments';

interface TimeSlot {
  time: string;
  label: string;
}

interface DayData {
  date: Date;
  dateString: string; // YYYY-MM-DD
  slots: TimeSlot[];
  isLoading: boolean;
  hasSlots: boolean;
}

interface AppointmentCalendarProps {
  doctorId?: string | number;
  selectedDate?: string; // YYYY-MM-DD
  onDateSelect: (date: string, slots: TimeSlot[]) => void;
  className?: string;
}

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// Format time slot từ API (ví dụ: "09:00:00" -> "09:00" hoặc "Ca sáng")
const formatTimeSlot = (time: string): string => {
  const [hours] = time.split(':');
  const hour = parseInt(hours, 10);
  
  if (hour >= 6 && hour < 12) return 'Ca sáng';
  if (hour >= 12 && hour < 18) return 'Ca chiều';
  if (hour >= 18) return 'Ca tối';
  return time.slice(0, 5); // Fallback: hiển thị giờ phút
};

// Tạo label cho time slot (ví dụ: "09:00-10:00" hoặc "Ca sáng")
const createSlotLabel = (time: string, index: number, allSlots: string[]): string => {
  const formatted = formatTimeSlot(time);
  
  // Nếu có nhiều slot liên tiếp, có thể group lại
  if (formatted.includes('Ca')) {
    return formatted;
  }
  
  // Hiển thị khoảng thời gian nếu có slot tiếp theo
  if (index < allSlots.length - 1) {
    const nextTime = allSlots[index + 1];
    return `${time.slice(0, 5)}–${nextTime.slice(0, 5)}`;
  }
  
  return time.slice(0, 5);
};

export function AppointmentCalendar({
  doctorId,
  selectedDate,
  onDateSelect,
  className,
}: AppointmentCalendarProps) {
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [loadingDays, setLoadingDays] = useState<Set<string>>(new Set());

  // Tháng hiện tại đang hiển thị trên calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const isPastDate = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  // Fetch slots cho các ngày trong tháng hiện tại
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Tạo danh sách ngày trong tháng hiện tại
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: DayData[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        slots: [],
        isLoading: false,
        hasSlots: false,
      });
    }

    // Nếu chưa có doctorId thì chỉ hiển thị calendar trống
    if (!doctorId) {
      setDaysData(days);
      setLoadingDays(new Set());
      return;
    }

    const fetchSlotsForMonth = async () => {
      // Chỉ fetch cho các ngày không nằm trong quá khứ
      const nonPastDays = days.filter((day) => !isPastDate(day.date));
      setLoadingDays(new Set(nonPastDays.map((d) => d.dateString)));

      const promises = days.map(async (day) => {
        if (isPastDate(day.date)) {
          return day;
        }

        try {
          const slots = await appointmentsAPI.getAvailableSlots(doctorId, day.dateString);

          const timeSlots: TimeSlot[] = slots.map((slot, index) => ({
            time: slot,
            label: createSlotLabel(slot, index, slots),
          }));

          return {
            ...day,
            slots: timeSlots,
            isLoading: false,
            hasSlots: timeSlots.length > 0,
          };
        } catch (error) {
          console.error(`Error fetching slots for ${day.dateString}:`, error);
          return {
            ...day,
            slots: [],
            isLoading: false,
            hasSlots: false,
          };
        }
      });

      const results = await Promise.all(promises);
      setDaysData(results);
      setLoadingDays(new Set());
    };

    fetchSlotsForMonth();
  }, [doctorId, currentMonth, today]);

  const handleDayClick = (day: DayData) => {
    if (isPastDate(day.date) || !day.hasSlots) return;
    onDateSelect(day.dateString, day.slots);
  };

  const getDayOfWeek = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Chủ nhật = 6, Thứ 2 = 0
  };

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth]
  );

  const isOnCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  }, [currentMonth]);

  const goToPrevMonth = () => {
    if (isOnCurrentMonth) return;
    setDaysData([]);
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setDaysData([]);
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Group days theo tuần để hiển thị grid
  const weeks = useMemo(() => {
    if (daysData.length === 0) return [];
    
    const weeks: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];
    
    daysData.forEach((day) => {
      const weekday = getDayOfWeek(day.date);
      
      // Nếu bắt đầu tuần mới (Thứ 2) và đã có tuần trước
      if (weekday === 0 && currentWeek.length > 0) {
        // Padding ngày trống ở cuối tuần trước
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      // Padding ngày trống ở đầu tuần nếu cần
      while (currentWeek.length < weekday) {
        currentWeek.push(null);
      }
      
      currentWeek.push(day);
      
      // Nếu đã đủ 7 ngày
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Xử lý tuần cuối cùng nếu chưa đủ 7 ngày
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [daysData]);

  return (
    <div className={cn('w-full', className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={isOnCurrentMonth}
          className={cn(
            'inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs sm:text-sm',
            'hover:bg-muted transition-colors',
            isOnCurrentMonth && 'opacity-40 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Tháng trước</span>
        </button>

        <div className="text-sm sm:text-base font-semibold text-foreground text-center">
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className={cn(
            'inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs sm:text-sm',
            'hover:bg-muted transition-colors'
          )}
        >
          <span className="hidden sm:inline mr-1">Tháng sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header với thứ trong tuần */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.replace('Thứ ', 'T').replace('Chủ nhật', 'CN')}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              if (!day || !day.dateString) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />;
              }

              const isPast = isPastDate(day.date);
              const isSelected = selectedDate === day.dateString;
              const isToday =
                day.date.toDateString() === new Date().toDateString();
              const isLoading = loadingDays.has(day.dateString);
              const canSelect = !isPast && day.hasSlots;

              return (
                <button
                  key={day.dateString}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={!canSelect || isLoading}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 transition-all',
                    'flex flex-col items-center justify-start p-1 sm:p-1.5',
                    'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                    'min-h-[60px] sm:min-h-[80px]',
                    {
                      // Disabled state (quá khứ hoặc không có slots)
                      'opacity-40 cursor-not-allowed border-muted bg-muted/30':
                        isPast || (!day.hasSlots && !isLoading),
                      // Available state
                      'cursor-pointer border-border bg-background hover:border-primary hover:bg-primary/5':
                        canSelect && !isSelected,
                      // Selected state
                      'border-primary bg-primary/10 shadow-md': isSelected,
                      // Today highlight
                      'ring-2 ring-offset-1 ring-primary/30': isToday && !isSelected,
                    }
                  )}
                >
                  {/* Số ngày */}
                  <span
                    className={cn(
                      'text-sm font-medium mb-1',
                      {
                        'text-muted-foreground': isPast || !day.hasSlots,
                        'text-foreground': canSelect,
                        'text-primary font-bold': isSelected,
                        'text-primary': isToday && !isSelected,
                      }
                    )}
                  >
                    {day.date.getDate()}
                  </span>

                  {/* Loading indicator */}
                  {isLoading && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}

                  {/* Time slots badges */}
                  {!isLoading && day.hasSlots && (
                    <div className="flex flex-wrap gap-0.5 justify-center w-full mt-auto max-h-[60%] overflow-hidden">
                      {day.slots.slice(0, 2).map((slot, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary',
                            'font-medium truncate max-w-full block'
                          )}
                          title={`${slot.label} (${slot.time.slice(0, 5)})`}
                        >
                          {slot.label}
                        </span>
                      ))}
                      {day.slots.length > 2 && (
                        <span 
                          className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-medium"
                          title={`Còn ${day.slots.length - 2} ca khác`}
                        >
                          +{day.slots.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Empty state indicator */}
                  {!isLoading && !day.hasSlots && !isPast && (
                    <span className="text-[9px] text-muted-foreground">Trống</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10" />
          <span>Đã chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-border ring-2 ring-offset-1 ring-primary/30" />
          <span>Hôm nay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-muted bg-muted/30 opacity-40" />
          <span>Không có lịch</span>
        </div>
      </div>
    </div>
  );
}

