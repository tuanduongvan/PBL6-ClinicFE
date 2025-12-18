export interface Schedule {
  id: number;
  doctor: number;
  doctor_name: string;
  day_of_week: number;
  day_of_week_display: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients: number;
}

export interface CreateSchedulePayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_patients?: number;
  is_available?: boolean;
}