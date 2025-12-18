export type AppointmentStatus = 'pending' | 'accepted' | 'confirmed' | 'rejected' | 'completed' | 'canceled';

// Kiểu Appointment đồng bộ với backend Django
export interface Appointment {
  id: number;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM[:SS]
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  duration?: number; // Duration in minutes

  // Computed field for display (combines date + time)
  dateTime?: string; // ISO datetime string for convenience

  // Dữ liệu quan hệ (đơn giản hóa để hiển thị cơ bản nếu cần)
  patient?: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
    };
  } | null;

  doctor?: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
    };
    specialty?: {
      id: number;
      name: string;
    } | null;
    price?: number;
    experience?: number;
  } | null;
}