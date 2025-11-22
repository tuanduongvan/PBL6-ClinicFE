// User types
export type UserRole = 1 | 2 | 3; // 1: doctor, 2: patient, 3: admin

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
  role: 1;
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
  workSchedule: WorkSchedule;
  patients?: number;
}

export interface Patient extends User {
  role: 2;
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
  password_confirm: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  role: UserRole;
}

export interface AuthSuccessResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface AuthValidationErrorResponse {
  message: string;
  errors: {
    non_field_errors?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface AuthExceptionResponse {
  success: false;
  message: string;
}

export type AuthResponse =
  | AuthSuccessResponse
  | AuthValidationErrorResponse
  | AuthExceptionResponse;
