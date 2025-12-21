import apiClient from './axios-config'
import axios from 'axios'

export interface FileUploadResponse {
  url?: string
  filename?: string
  file?: string
  file_url?: string
}

/**
 * Upload a file to the server
 * @param file File to upload
 * @param endpoint API endpoint for file upload (default: '/media/upload/')
 * @returns URL of the uploaded file
 */
export const fileUploadAPI = {
  upload: async (
    file: File,
    endpoint: string = '/media/upload/'
  ): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('authToken')
        : null

      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:8000/api'
      
      const response = await axios.post<FileUploadResponse>(
        `${baseURL}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )
      const url = response.data.url || 
                  response.data.file_url || 
                  response.data.file || 
                  response.data.filename

      if (!url) {
        throw new Error('Server did not return file URL')
      }

      return url
    } catch (error: any) {
      console.error('Error uploading file:', error)
      
      if (error.response?.status === 404) {
        throw {
          message: 'File upload endpoint not found. Please use URL input instead.',
          errors: {},
        }
      }
      
      throw {
        message: error.response?.data?.message || 
                error.response?.data?.detail || 
                error.message || 
                'File upload failed',
        errors: error.response?.data?.errors || {},
      }
    }
  },

  /**
   * Validate if file is a document type
   */
  isDocumentFile: (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain',
      'image/jpeg',
      'image/png',
    ]

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png']

    // Check MIME type
    if (allowedTypes.includes(file.type)) {
      return true
    }

    // Check file extension as fallback
    const fileName = file.name.toLowerCase()
    return allowedExtensions.some(ext => fileName.endsWith(ext))
  },

  /**
   * Get file size in MB
   */
  getFileSizeMB: (file: File): number => {
    return file.size / (1024 * 1024)
  },
}

