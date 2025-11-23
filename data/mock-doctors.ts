import { Doctor } from '@/types/doctor';

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    username: 'dr_smith',
    email: 'dr.smith@dermaclinic.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0101',
    gender: 1,
    role: 1,
    specialization: 'Dermatology',
    experience: 12,
    rating: 4.8,
    bio: 'Specialist in acne treatment and skin rejuvenation. 12 years of experience.',
    workSchedule: {
      'Monday': [
        { startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      'Tuesday': [
        { startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      'Wednesday': [
        { startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      'Thursday': [
        { startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      'Friday': [
        { startTime: '09:00', endTime: '14:00', isAvailable: true },
      ],
    },
    patients: 450,
    createdAt: new Date().toISOString(),
    avatar: '/professional-male-doctor.jpg',
  },
  {
    id: 2,
    username: 'dr_johnson',
    email: 'dr.johnson@dermaclinic.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1-555-0102',
    gender: 1,
    role: 1,
    specialization: 'Cosmetology',
    experience: 10,
    rating: 4.9,
    bio: 'Expert in cosmetic procedures and anti-aging treatments.',
    workSchedule: {
      'Monday': [
        { startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
      'Tuesday': [
        { startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
      'Wednesday': [
        { startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
      'Friday': [
        { startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
      'Saturday': [
        { startTime: '10:00', endTime: '14:00', isAvailable: true },
      ],
    },
    patients: 380,
    createdAt: new Date().toISOString(),
    avatar: '/professional-female-doctor.jpg',
  },
  {
    id: 3,
    username: 'dr_williams',
    email: 'dr.williams@dermaclinic.com',
    firstName: 'Michael',
    lastName: 'Williams',
    phone: '+1-555-0103',
    gender: 1,
    role: 2,
    specialization: 'Surgical Dermatology',
    experience: 15,
    rating: 4.7,
    bio: 'Specialized in mole removal and skin surgery. 15 years of practice.',
    workSchedule: {
      'Monday': [
        { startTime: '09:00', endTime: '16:00', isAvailable: true },
      ],
      'Tuesday': [
        { startTime: '09:00', endTime: '16:00', isAvailable: true },
      ],
      'Wednesday': [
        { startTime: '09:00', endTime: '16:00', isAvailable: true },
      ],
      'Thursday': [
        { startTime: '09:00', endTime: '16:00', isAvailable: true },
      ],
      'Friday': [
        { startTime: '09:00', endTime: '12:00', isAvailable: true },
      ],
    },
    patients: 520,
    createdAt: new Date().toISOString(),
    avatar: '/professional-male-doctor-surgical.jpg',
  },
];
