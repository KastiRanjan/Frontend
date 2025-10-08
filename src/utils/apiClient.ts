import axios, { AxiosError, AxiosInstance } from 'axios';

// Create a custom axios instance with better error handling
const createApiClient = (baseURL?: string): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: 10000, // 10 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Add request interceptor for auth token
  apiClient.interceptors.request.use(
    (config) => {
      // You could add auth token here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => {
      // Log successful responses for debugging if needed
      if (import.meta.env.DEV) {
        console.debug(`API Success [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
          status: response.status,
          data: response.data
        });
      }
      return response;
    },
    (error: AxiosError) => {
      // Enhanced error logging
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
        });
      } else if (error.request) {
        // Request was made but no response received
        console.error('API No Response:', {
          request: error.request,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
        });
      } else {
        // Something happened in setting up the request
        console.error('API Request Error:', error.message, {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
        });
      }
      
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Create clients
const backendURI = import.meta.env.VITE_BACKEND_URI || 'http://localhost:7777';

export const apiClient = createApiClient('/api');
export const directApiClient = createApiClient(backendURI);

// Helper functions
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response?.data?.message) {
      // If the server sent a message
      if (Array.isArray(axiosError.response.data.message)) {
        return axiosError.response.data.message[0];
      }
      return axiosError.response.data.message;
    } else if (axiosError.response?.status === 404) {
      return 'Resource not found';
    } else if (axiosError.response?.status === 403) {
      return 'You do not have permission to perform this action';
    } else if (axiosError.response?.status === 401) {
      return 'Authentication required. Please log in again.';
    } else if (axiosError.response) {
      return `Server error (${axiosError.response.status})`;
    } else if (axiosError.request) {
      return 'No response from server. Please check your internet connection.';
    }
    return axiosError.message;
  }
  
  return 'An unknown error occurred';
};