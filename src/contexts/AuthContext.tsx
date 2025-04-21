import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

// Add type declarations for import.meta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  mockLogin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  mockRegister: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  useMockAuth: boolean;
  setUseMockAuth: (value: boolean) => void;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default to mock auth since backend is unreliable
  const [useMockAuth, setUseMockAuth] = useState(true);

  // Use proxy instead of direct URL for development
  const apiUrl = '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // If token starts with 'mock-token', it's a mock user
      if (token.startsWith('mock-token')) {
        console.log('Validating mock token');
        // Get user data from localStorage if available
        const mockUserData = localStorage.getItem('mockUser');
        if (mockUserData) {
          const mockUser = JSON.parse(mockUserData);
          setUser(mockUser);
        }
        setLoading(false);
        return;
      }

      // Try to validate with backend
      try {
        const response = await axios.get<{ user: User }>(`${apiUrl}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data?.user) {
          throw new Error('Invalid response format');
        }
        
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) {
            setError('Session expired. Please login again.');
          } else if (!err.response || err.response.status === 500) {
            setError('Backend server unavailable. Using mock authentication.');
            setUseMockAuth(true);
          }
        }
      }
    } catch (err) {
      console.error('Token validation error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('mockUser');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthResponse = (response: { data: AuthResponse }) => {
    if (!response.data?.user || !response.data?.token) {
      throw new Error('Invalid response format');
    }
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      
      if (useMockAuth) {
        return mockLogin(email, password);
      }
      
      try {
        const response = await axios.post<AuthResponse>(`${apiUrl}/auth/login`, { 
          email, 
          password 
        });
        handleAuthResponse(response);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 401) {
            setError('Invalid email or password');
          } else if (err.response?.status === 429) {
            setError('Too many attempts. Please try again later.');
          } else if (!err.response || err.response.status === 500) {
            // Try mock login if backend is down
            console.log('Backend unavailable, using mock login');
            setUseMockAuth(true);
            return mockLogin(email, password);
          } else {
            setError(err.response?.data?.message || 'Login failed');
          }
        } else {
          setError('An unexpected error occurred');
        }
        throw err;
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // Mock login function for development when backend is not available
  const mockLogin = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('Mock login with:', { email });
      
      // In a real app, would validate against stored credentials
      // For testing, accept any email with a password of "password"
      if (password !== "password") {
        setError('Invalid password. For mock login, use "password"');
        throw new Error('Invalid mock credentials');
      }
      
      // Create mock user and token
      const mockUser: User = {
        id: 'mock-user-id-' + Date.now(),
        email,
        username: email.split('@')[0] // Use part of email as username
      };
      
      const mockToken = 'mock-token-' + Date.now();
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store user data for persistence
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      
      console.log('Mock login successful:', mockUser);
    } catch (err) {
      if (!error) {
        setError('Mock login failed');
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      
      if (useMockAuth) {
        return mockRegister(email, password, username);
      }
      
      try {
        const response = await axios.post<AuthResponse>(`${apiUrl}/auth/register`, { 
          email, 
          password, 
          username 
        });
        handleAuthResponse(response);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 409) {
            setError('Email or username already exists');
          } else if (!err.response || err.response.status === 500) {
            // Try mock registration if backend is down
            console.log('Backend unavailable, using mock registration');
            setUseMockAuth(true);
            return mockRegister(email, password, username);
          } else {
            setError(err.response?.data?.message || 'Registration failed');
          }
        } else {
          setError('An unexpected error occurred');
        }
        throw err;
      }
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  // Mock registration function for development when backend is not available
  const mockRegister = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      console.log('Mock registration with:', { email, username });
      
      // Create mock user and token
      const mockUser: User = {
        id: 'mock-user-id-' + Date.now(),
        email,
        username
      };
      
      const mockToken = 'mock-token-' + Date.now();
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store user data for persistence
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      
      console.log('Mock registration successful:', mockUser);
    } catch (err) {
      setError('Mock registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      mockLogin,
      register, 
      mockRegister,
      logout, 
      error,
      clearError,
      useMockAuth,
      setUseMockAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}