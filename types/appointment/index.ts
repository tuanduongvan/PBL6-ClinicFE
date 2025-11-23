export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}