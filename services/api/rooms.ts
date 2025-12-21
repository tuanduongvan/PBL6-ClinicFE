import apiClient from './axios-config'

export interface Room {
  id: number
  name: string
  location: string
}

export const roomsAPI = {
  // Get all rooms
  getAll: async (): Promise<Room[]> => {
    try {
      const response = await apiClient.get('/rooms/')
      return response.data as Room[]
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  },

  // Get room by ID
  getById: async (id: number): Promise<Room | null> => {
    try {
      const response = await apiClient.get(`/rooms/${id}/`)
      return response.data as Room
    } catch (error) {
      console.error('Error fetching room:', error)
      return null
    }
  },
}

