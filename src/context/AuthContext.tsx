import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  logout: () => {},
  refreshAuth: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (on component mount)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Set default auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user profile
        const response = await axios.get('/api/auth/me');
        
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setError('Session expired. Please login again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      
      const { token, refreshToken, user: userData } = response.data;
      
      // Save tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set default auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/api/auth/refresh', {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Update auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (err) {
      // Force logout if refresh fails
      logout();
      return false;
    }
  };

  const logout = () => {
    // Remove tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setError(null);
  };

  // Setup axios interceptor for handling 401 errors
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 (Unauthorized) and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshed = await refreshAuth();
            
            if (refreshed) {
              // Retry the original request with the new token
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, proceed with logout
            logout();
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};