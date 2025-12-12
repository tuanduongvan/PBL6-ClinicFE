import { Appointment } from '@/types/appointment';

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '101',
    doctorId: '1',
    dateTime: new Date(new Date().getTime() + 86400000).toISOString(),
    duration: 30,
    status: 'confirmed',
    notes: 'Follow-up for acne treatment',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    patientId: '102',
    doctorId: '2',
    dateTime: new Date(new Date().getTime() + 172800000).toISOString(),
    duration: 45,
    status: 'pending',
    notes: 'Consultation for anti-aging treatment',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    patientId: '101',
    doctorId: '1',
    dateTime: new Date(new Date().getTime() - 86400000).toISOString(),
    duration: 30,
    status: 'completed',
    notes: 'Completed consultation for skin condition',
    createdAt: new Date(new Date().getTime() - 172800000).toISOString(),
  },
];
