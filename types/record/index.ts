export interface AppointmentRecord {
  id: number;
  appointment: {
    id: number;
    date: string;
    time: string;
    status: string;
    patient?: {
      id: number;
      user: {
        first_name: string;
        last_name: string;
      };
    };
    doctor?: {
      id: number;
      user: {
        first_name: string;
        last_name: string;
      };
    };
  };
  reason?: string;
  description?: string;
  status_before?: string;
  status_after?: string;
  created_at: string;
  updated_at: string;
}

