export interface Drug {
  id: number;
  name: string;
  description?: string;
}

export type TimingType = 'before' | 'after' | 'with' | 'anytime';

export interface TreatmentDrug {
  id?: number;
  drug?: Drug | null;
  drug_id?: number | null;
  dosage: string;
  timing: TimingType;
  minutes_before_after?: number | null;
  notes?: string | null;
  order?: number;
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
  drugs?: TreatmentDrug[];
  repeat_days?: string;
  repeat_time?: string;
  created_at?: string;
  updated_at?: string;
}

