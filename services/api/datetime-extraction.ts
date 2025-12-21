/**
 * API service for extracting date and time from Vietnamese text
 */

export interface DateTimeExtractionResponse {
  input_text?: string;
  extracted?: {
    date: string; // Format: "26/12/2025"
    time: string; // Format: "9:30"
  };
  error?: string; // Error message from API
}

export const datetimeExtractionAPI = {
  /**
   * Extract date and time from Vietnamese text
   * @param text Vietnamese text containing date and time information
   * @returns Extracted date and time information
   */
  extract: async (text: string): Promise<DateTimeExtractionResponse> => {
    try {
      // Use Next.js API route to proxy the request and avoid CORS issues
      const apiRoute = '/api/extract-datetime';
      
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorData = { error: errorText || `API error: ${response.status} ${response.statusText}` };
          } catch {
            errorData = { error: `API error: ${response.status} ${response.statusText}` };
          }
        }
        
        // Create error object with response data for better error handling
        const error = new Error(
          errorData.error || errorData.message || `API error: ${response.status} ${response.statusText}`
        ) as any;
        
        // Attach response data to error for getErrorMessage to use
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        
        throw error;
      }

      const data: DateTimeExtractionResponse = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API');
      }
      
      // If response has error field, return it
      if (data.error) {
        return { error: data.error };
      }
      
      if (!data.extracted || typeof data.extracted !== 'object') {
        throw new Error('Missing extracted data in response');
      }
      
      return data;
    } catch (error: any) {
      console.error('Error extracting datetime:', error);
      
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Network error: Failed to fetch - Please check your internet connection');
      }
      
      throw error;
    }
  },

  /**
   * Convert extracted date format (DD/MM/YYYY) to YYYY-MM-DD
   * @param dateString Date in format "26/12/2025"
   * @returns Date in format "2025-12-26"
   */
  convertDateFormat: (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },

  /**
   * Convert extracted time format to HH:MM:SS
   * @param timeString Time in format "9:30" or "09:30"
   * @returns Time in format "09:30:00"
   */
  convertTimeFormat: (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  },
};

