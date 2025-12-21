import apiClient from './axios-config';
import { Doctor } from '@/types/doctor';
import { User } from '@/types/auth';
import { Appointment } from '@/types/appointment';

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  totalRevenue: number;
  appointmentsPerMonth?: Array<{
    month: string;
    count: number;
  }>;
  revenueTrends?: Array<{
    month: string;
    revenue: number;
  }>;
  recentActivity?: Array<{
    id: number;
    type: 'appointment' | 'registration' | 'verification';
    message: string;
    timestamp: string;
  }>;
}

export interface DoctorVerificationParams {
  status: 'VERIFIED' | 'REJECTED';
}

export const adminApi = {
  // Get dashboard statistics by aggregating data from existing endpoints
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch data from multiple endpoints in parallel
      const [doctorsResponse, patientsResponse, appointmentsResponse] = await Promise.all([
        // Get all doctors
        apiClient.get('/doctors/').then((res) => Array.isArray(res.data) ? res.data : []).catch(() => []),
        // Get all patients (admin only endpoint)
        apiClient.get('/patients/').then((res) => {
          const data = Array.isArray(res.data) ? res.data : [];
          return data.map((patient: any) => patient.user || patient);
        }).catch(() => []),
        // Get all appointments
        apiClient.get('/appointments/').then((res) => Array.isArray(res.data) ? res.data : []).catch(() => []),
      ]);

      const doctors = Array.isArray(doctorsResponse) ? doctorsResponse : [];
      const patients = Array.isArray(patientsResponse) ? patientsResponse : [];
      const appointments = Array.isArray(appointmentsResponse) ? appointmentsResponse : [];

      // Calculate today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Filter today's appointments
      const todayAppointments = appointments.filter((apt) => apt.date === todayStr);

      // Calculate total revenue from completed appointments
      const completedAppointments = appointments.filter(
        (apt) => apt.status === 'completed' && apt.doctor?.price
      );
      const totalRevenue = completedAppointments.reduce((sum, apt) => {
        return sum + (apt.doctor?.price || 0);
      }, 0);

      // Group appointments by month
      const appointmentsByMonth = new Map<string, number>();
      appointments.forEach((apt) => {
        if (apt.date) {
          const month = apt.date.substring(0, 7); // YYYY-MM
          appointmentsByMonth.set(month, (appointmentsByMonth.get(month) || 0) + 1);
        }
      });

      // Convert to array format for charts
      const appointmentsPerMonth = Array.from(appointmentsByMonth.entries())
        .map(([month, count]) => ({
          monthKey: month, // Keep original for sorting
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count,
        }))
        .sort((a, b) => {
          // Sort by original month key
          return a.monthKey.localeCompare(b.monthKey);
        })
        .map(({ month, count }) => ({ month, count })); // Remove monthKey from final output

      // Group revenue by month
      const revenueByMonth = new Map<string, number>();
      completedAppointments.forEach((apt) => {
        if (apt.date && apt.doctor?.price) {
          const month = apt.date.substring(0, 7);
          revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + (apt.doctor.price || 0));
        }
      });

      const revenueTrends = Array.from(revenueByMonth.entries())
        .map(([month, revenue]) => ({
          monthKey: month, // Keep original for sorting
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
        }))
        .sort((a, b) => {
          // Sort by original month key
          return a.monthKey.localeCompare(b.monthKey);
        })
        .map(({ month, revenue }) => ({ month, revenue })); // Remove monthKey from final output

      // Generate recent activity from appointments and doctor verifications
      const recentActivity: DashboardStats['recentActivity'] = [];
      
      // Add recent appointments
      const recentAppointments = appointments
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      recentAppointments.forEach((apt) => {
        const patientName = apt.patient?.user
          ? `${apt.patient.user.first_name} ${apt.patient.user.last_name}`
          : 'Unknown';
        recentActivity.push({
          id: apt.id,
          type: 'appointment',
          message: `New appointment scheduled by ${patientName}`,
          timestamp: apt.created_at,
        });
      });

      // Add pending doctor verifications
      const pendingDoctors = doctors.filter((d) => d.verificationStatus === 'PENDING');
      pendingDoctors.slice(0, 3).forEach((doctor) => {
        const doctorName = doctor.user
          ? `${doctor.user.first_name} ${doctor.user.last_name}`
          : 'Unknown';
        recentActivity.push({
          id: doctor.id,
          type: 'verification',
          message: `Doctor ${doctorName} is pending verification`,
          timestamp: doctor.created_at || new Date().toISOString(),
        });
      });

      // Sort by timestamp and limit to 10
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      recentActivity.splice(10);

      return {
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        totalRevenue,
        appointmentsPerMonth,
        revenueTrends,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return empty data on error
      return {
        totalDoctors: 0,
        totalPatients: 0,
        todayAppointments: 0,
        totalRevenue: 0,
        appointmentsPerMonth: [],
        revenueTrends: [],
        recentActivity: [],
      };
    }
  },

  // Get all doctors with optional filters
  getAllDoctors: async (params?: {
    verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    search?: string;
  }): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get('/doctors/', { params });
      const apiDoctors = Array.isArray(response.data) ? response.data : [];
      return apiDoctors;
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      return [];
    }
  },

  // Verify/Approve a doctor
  verifyDoctor: async (doctorId: number, status: 'VERIFIED' | 'REJECTED'): Promise<Doctor> => {
    try {
      const endpoint = status === 'VERIFIED' 
        ? `/doctors/${doctorId}/approve/`
        : `/doctors/${doctorId}/reject/`;
      
      const response = await apiClient.patch(endpoint, {});
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error ${status === 'VERIFIED' ? 'approving' : 'rejecting'} doctor:`, error);
      throw error;
    }
  },

  // Get all users (patients and doctors)
  getAllUsers: async (params?: {
    role?: number;
    search?: string;
  }): Promise<User[]> => {
    try {
      // For patients (role 3), use the /patients/ endpoint directly
      if (params?.role === 3) {
        try {
          const response = await apiClient.get('/patients/');
          const patients = Array.isArray(response.data) ? response.data : [];
          // Extract user data from patient objects
          return patients.map((patient: any) => {
            // If patient has a nested user object, use it; otherwise use patient as user
            if (patient.user) {
              return {
                ...patient.user,
                id: patient.user.id || patient.id,
              };
            }
            // If patient is already a user object, return it directly
            return patient;
          });
        } catch (error: any) {
          // If 403, user might not have admin permissions (is_staff)
          if (error.response?.status === 403) {
            console.warn('Access denied: Admin permissions required to view all patients');
            return [];
          }
          throw error;
        }
      }
      
      // For other roles or no role filter, try admin endpoint (if it exists in future)
      // For now, return empty array if not requesting patients
      console.warn('getAllUsers: Only role 3 (patients) is currently supported');
      return [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  // Get all appointments
  getAllAppointments: async (params?: {
    status?: string;
    date?: string;
  }): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get('/appointments/', { params });
      const appointments = Array.isArray(response.data) ? response.data : [];
      return appointments;
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      return [];
    }
  },
};

