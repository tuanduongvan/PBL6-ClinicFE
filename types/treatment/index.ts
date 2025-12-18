export interface Drug {
  id: number;
  name: string;
  description?: string;
}

export interface Treatment {
  id: number;
  appointment: {
    id: number;
    date: string;
    time: string;
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
  name: string;
  purpose: string;
  drug?: Drug | null;
  dosage?: string;
  repeat_days?: string;
  repeat_time?: string;
}

