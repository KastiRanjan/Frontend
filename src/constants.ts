// API endpoints and other constants
// Use Vite environment variable (preferred) or fallback to React environment variable for backward compatibility
export const backendURI = import.meta.env.VITE_BACKEND_URI || process.env.REACT_APP_API_URL || 'http://localhost:7777';

// Environment information
export const environment = import.meta.env.VITE_ENVIRONMENT || 'localhost';
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
export const isCloudflareSetup = environment === 'cloudflare' || backendURI.includes('https://');

// API configuration
export const API_CONFIG = {
  baseURL: backendURI,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  withCredentials: true,
  environment,
  isCloudflare: isCloudflareSetup
};

// Debug configuration in development
if (isDevelopment) {
  console.log('🔧 Frontend Configuration:', {
    backendURI,
    environment,
    isProduction,
    isDevelopment,
    isCloudflareSetup,
    apiConfig: API_CONFIG
  });
}