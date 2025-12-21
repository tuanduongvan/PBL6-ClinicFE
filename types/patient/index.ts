import { User } from '@/types/auth'

export interface Patient extends User {
  role: {
    id: 3;
    name: 'Patient'; 
  };
  health_insurance_number?: string | null;
  occupation?: string | null;
  medical_history?: string | null;
}