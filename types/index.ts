// User types
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
  workSchedule: WorkSchedule;
  patients?: number;
}

export interface Patient extends User {
  role: 'patient';
  medicalHistory?: string;
}

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// Work schedule types
export interface WorkSchedule {
  [key: string]: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Authentication
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
