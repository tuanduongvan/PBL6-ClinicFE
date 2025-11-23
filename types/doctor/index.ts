import { User } from '@/types/auth'
import { WorkSchedule } from '@/types/schudele'

export interface Doctor extends User {
    role: {
    id: 2;
    name: 'Doctor'; 
  };
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
  workSchedule: WorkSchedule;
  patients?: number;
}