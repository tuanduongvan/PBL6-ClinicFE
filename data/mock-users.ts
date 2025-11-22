import { Patient, User } from '@/types';

export const mockAdmin: User = {
  id: '0',
  username: 'admin',
  email: 'admin@dermaclinic.com',
  firstName: 'Admin',
  lastName: 'User',
  phone: '+1-555-0100',
  gender: 'male',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const mockPatients: Patient[] = [
  {
    id: '101',
    username: 'john_doe',
    email: 'john@email.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-1001',
    gender: 'male',
    role: 'patient',
    medicalHistory: 'Acne-prone skin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '102',
    username: 'jane_smith',
    email: 'jane@email.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-1002',
    gender: 'female',
    role: 'patient',
    medicalHistory: 'Sensitive skin',
    createdAt: new Date().toISOString(),
  },
];
