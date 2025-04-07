import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
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
      const response = await axios.get<{ user: User }>('/api/auth/validate', {
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
        } else if (!err.response) {
          setError('Network error. Please check your connection.');
        }
      }
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
      const response = await axios.post<AuthResponse>('/api/auth/login', { 
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
        } else if (!err.response) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.response?.data?.message || 'Login failed');
        }
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      const response = await axios.post<AuthResponse>('/api/auth/register', { 
        email, 
        password, 
        username 
      });
      handleAuthResponse(response);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          setError('Email or username already exists');
        } else if (!err.response) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.response?.data?.message || 'Registration failed');
        }
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      error,
      clearError 
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