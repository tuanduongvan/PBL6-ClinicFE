import apiClient from './axios-config';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  PatientRegisterPayload,
  DoctorRegisterPayload,
  AuthResponse 
} from '@/types/auth';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login/', credentials);
      const data = response.data;

      if (data.tokens?.access) {
        localStorage.setItem('authToken', data.tokens.access);
      }
      if (data.tokens?.refresh) {
        localStorage.setItem('refreshToken', data.tokens.refresh);
      }

      return data;
    } catch (error: any) {

      const errData = error.response?.data;

      if (errData?.errors) {
        return {
          message: errData.message || 'Login failed!',
          errors: errData.errors
        };
      }
      return {
        success: false,
        message: errData?.message || 'Login failed'
      };
    }
  },

  /**
   * Register a new patient account
   */
  registerPatient: async (credentials: PatientRegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/signup/', credentials);
      if (response.data.tokens?.access) {
        localStorage.setItem('authToken', response.data.tokens.access);
      }
      if (response.data.tokens?.refresh) {
        localStorage.setItem('refreshToken', response.data.tokens.refresh);
      }
      return response.data;
    } catch (error: any) {
      const errData = error.response?.data;
      if (errData?.errors) {
        return {
          message: errData.message || 'Registration failed',
          errors: errData.errors
        };
      }
      return {
        success: false,
        message: errData?.message || 'Registration failed',
      };
    }
  },

  /**
   * Register a new doctor account
   * This creates both the user account and doctor profile
   */
  /**
   * Register a new doctor account
   * This creates both the user account and doctor profile
   * 
   * Backend expects snake_case field names, but accepts camelCase aliases for some fields:
   * - medicalLicenseUrl (accepted as alias for credentiaUrl)
   * - bio (accepted as alias for description)
   */
  registerDoctor: async (credentials: DoctorRegisterPayload): Promise<AuthResponse> => {
    try {
      // Map frontend field names to backend field names
      // Note: DoctorRegistrationSerializer doesn't need 'role' field (it's automatically set to Doctor)
      const backendPayload: any = {
        // User account fields (snake_case)
        username: credentials.username.trim(),
        password: credentials.password,
        password_confirm: credentials.password_confirm,
        phone: credentials.phone.trim(),
        email: credentials.email.trim().toLowerCase(),
        first_name: credentials.first_name.trim(),
        last_name: credentials.last_name.trim(),
        gender: credentials.gender || null,
        // role is NOT needed - backend automatically sets it to Doctor
        
        // Doctor-specific fields
        // Ensure numbers are properly formatted
        specialty: Number(credentials.specialty),
        price: Number(credentials.price),
        experience: credentials.experience !== null && credentials.experience !== undefined
          ? Number(credentials.experience)
          : null,
        
        // Backend accepts both medicalLicenseUrl and credentiaUrl as aliases
        medicalLicenseUrl: credentials.medicalLicenseUrl?.trim() || null,
        
        // Backend accepts both bio and description as aliases
        bio: credentials.bio?.trim() || null,
        
        // Optional fields
        ...(credentials.currentWorkplace && { 
          currentWorkplace: credentials.currentWorkplace.trim() 
        }),
        ...(credentials.avatar && { 
          avatar: credentials.avatar 
        }),
      };
      
      // Debug: Log the payload before sending
      console.log('API Payload (before request):', JSON.stringify(backendPayload, null, 2));
      
      const response = await apiClient.post('/doctors/register/', backendPayload);
      
      // Debug: Log the response
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      
      // Check if response is successful (status 201 Created)
      if (response.status === 201 && response.data.tokens?.access) {
        localStorage.setItem('authToken', response.data.tokens.access);
        if (response.data.tokens.refresh) {
          localStorage.setItem('refreshToken', response.data.tokens.refresh);
        }
        return response.data;
      }
      
      // If status is not 201, treat as error
      return {
        success: false,
        message: response.data?.message || 'Registration failed',
        ...(response.data?.errors && { errors: response.data.errors }),
      };
    } catch (error: any) {
      // Debug: Log the error details
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Data:', error.response?.data);
      console.error('API Error Headers:', error.response?.headers);
      console.error('API Error Full:', error);
      console.error('Error Message:', error.message);
      console.error('Error Code:', error.code);
      
      // Handle different error types
      const errData = error.response?.data || {};
      const statusCode = error.response?.status;
      
      // Network errors or no response
      if (!error.response) {
        return {
          success: false,
          message: error.message || 'Network error. Please check your connection.',
          errors: {}
        };
      }
      
      // Handle validation errors (400 Bad Request)
      if (statusCode === 400) {
        // Check if errors object exists and has content
        if (errData.errors && Object.keys(errData.errors).length > 0) {
          return {
            success: false,
            message: errData.message || 'Validation failed. Please check your input.',
            errors: errData.errors
          };
        }
        
        // If errors object is empty, check for error message
        if (errData.message) {
          return {
            success: false,
            message: errData.message,
            errors: errData.errors || {}
          };
        }
        
        // Fallback for 400 without clear error structure
        return {
          success: false,
          message: 'Invalid request. Please check your input data.',
          errors: {}
        };
      }
      
      // Handle authentication errors (401)
      if (statusCode === 401) {
        return {
          success: false,
          message: 'Authentication required. Please try again.',
          errors: {}
        };
      }
      
      // Handle server errors (500)
      if (statusCode === 500) {
        return {
          success: false,
          message: errData.message || errData.error || 'Server error. Please try again later.',
          errors: errData.errors || {}
        };
      }
      
      // Generic error response
      return {
        success: false,
        message: errData?.message || error.message || 'Registration failed. Please try again.',
        errors: errData?.errors || {}
      };
    }
  },

  /**
   * Generic register function (for backward compatibility)
   * @deprecated Use registerPatient or registerDoctor instead
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/signup/', credentials);
      if (response.data.tokens?.access) {
        localStorage.setItem('authToken', response.data.tokens.access);
      }
      if (response.data.tokens?.refresh) {
        localStorage.setItem('refreshToken', response.data.tokens.refresh);
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
