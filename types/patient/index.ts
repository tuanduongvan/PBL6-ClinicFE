import { User } from '@/types/auth'

export interface Patient extends User {
  role: {
    id: 3;
    name: 'Patient'; 
  };
  medicalHistory?: string;
}