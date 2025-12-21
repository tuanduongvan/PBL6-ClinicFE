import apiClient from './axios-config'
import { RegisterCredentials } from '@/types/auth'

export interface DoctorRegistrationData {
  // User account fields
  username: string
  password: string
  password_confirm: string
  phone: string
  email: string
  first_name: string
  last_name: string
  gender: number
  role: 2
  
  // Doctor-specific fields
  specialty: number
  room?: number | null
  price: number
  experience?: number | null
  medicalLicenseUrl?: string | null // Maps to credentiaUrl in backend
  currentWorkplace?: string | null
  bio?: string | null // Maps to description in backend
}

export interface DoctorRegistrationResponse {
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    phone: string
    role: {
      id: number
      name: string
    }
  }
  doctor: {
    id: number
    specialty: number | null
    room: number | null
    price: number
    experience: number | null
    credentiaUrl: string | null
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
    is_available: boolean
    description: string | null
  }
  tokens: {
    access: string
    refresh: string
  }
}

export const doctorRegistrationAPI = {
  register: async (data: DoctorRegistrationData): Promise<DoctorRegistrationResponse> => {
    try {
      const response = await apiClient.post('/doctors/register/', data)
      
      // Store token if available
      if (response.data.tokens?.access) {
        localStorage.setItem('authToken', response.data.tokens.access)
        if (response.data.tokens.refresh) {
          localStorage.setItem('refreshToken', response.data.tokens.refresh)
        }
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error registering doctor:', error)
      throw {
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || {},
      }
    }
  },
}

