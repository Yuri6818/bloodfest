import axios from 'axios';

// Default backend URL with fallback
const API_URL = '/api'; // Use proxy in development for same-origin requests

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Track online status
let isBackendOnline = true;

// Check if a token is a mock token
const isMockToken = (token: string) => {
  return token && token.startsWith('mock-token');
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // If using a mock token, don't make real API calls
  if (token && isMockToken(token)) {
    // This will cause the request to be cancelled
    // The response interceptor will handle it
    return {
      ...config,
      signal: AbortSignal.abort('Using mock data')
    };
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the request was aborted due to mock token
    if (error.name === 'AbortError' && error.message === 'Using mock data') {
      return Promise.reject({
        isMockData: true,
        message: 'Using mock data instead of real API'
      });
    }
    
    const originalRequest = error.config;
    
    if (!error.response) {
      isBackendOnline = false;
      console.error('Network error detected:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true
      });
    }
    
    if (error.response.status === 401 && !originalRequest._retry) {
      if (!originalRequest.url.includes('/auth/')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    if (error.response.status === 429) {
      return Promise.reject({
        message: 'Too many requests. Please try again later.'
      });
    }
    
    if (error.response.status === 500) {
      isBackendOnline = false;
      return Promise.reject({
        message: 'Server error. Please try again later.',
        isServerError: true
      });
    }
    
    return Promise.reject(error);
  }
);

// Export a function to check if backend is considered online
export const isBackendAvailable = () => isBackendOnline;

// Make a ping request to check backend status
export const checkBackendStatus = async () => {
  try {
    await axios.get('/api/status', { timeout: 2000 });
    isBackendOnline = true;
    return true;
  } catch (err) {
    isBackendOnline = false;
    return false;
  }
};

export default api;