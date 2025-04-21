import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { isValidEmail, getValidationErrorMessage } from '@utils/validation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError, useMockAuth, setUseMockAuth } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Set default password for mock auth
  useEffect(() => {
    if (useMockAuth && formData.password === '') {
      setFormData(prev => ({ ...prev, password: 'password' }));
    }
  }, [useMockAuth]);

  useEffect(() => {
    // Clear any existing errors when component mounts or unmounts
    return () => clearError();
  }, [clearError]);

  const validateField = (name: string, value: string) => {
    const errorMessage = getValidationErrorMessage(name, value);
    setFormErrors(prev => ({ ...prev, [name]: errorMessage || '' }));
    return !errorMessage;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearError(); // Clear error when user starts typing
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const toggleMockAuth = () => {
    setUseMockAuth(!useMockAuth);
    if (!useMockAuth) {
      // Switching to mock login, set password hint
      setFormData(prev => ({ ...prev, password: 'password' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    
    if (!isEmailValid || !isPasswordValid) {
      addNotification('error', 'Please correct the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      addNotification('success', 'Login successful');
      navigate('/');
    } catch (err: any) {
      // Error is handled by AuthContext
      console.error('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-3xl font-gothic text-blood-light mb-6">Login</h2>
      {error && (
        <div className="bg-blood/20 border border-blood text-blood-light p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-dark-darker border ${formErrors.email ? 'border-red-500' : 'border-blood/20'} rounded text-light-darker focus:outline-none focus:border-blood`}
            required
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-dark-darker border ${formErrors.password ? 'border-red-500' : 'border-blood/20'} rounded text-light-darker focus:outline-none focus:border-blood`}
            required
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
          {useMockAuth && (
            <p className="text-amber-400 text-sm mt-1">For mock login, use password: "password"</p>
          )}
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="useMockAuth"
            checked={useMockAuth}
            onChange={toggleMockAuth}
            className="mr-2"
          />
          <label htmlFor="useMockAuth" className="text-sm">
            {useMockAuth 
              ? "Using mock authentication (backend unavailable)" 
              : "Try to use real backend authentication (may fail)"}
          </label>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blood text-dark font-bold py-2 px-4 rounded hover:bg-blood-light transition duration-300 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : (useMockAuth ? 'Login (Mock)' : 'Login')}
        </button>
        <p className="text-center text-light-darker">
          Don't have an account?{' '}
          <Link to="/register" className="text-blood-light hover:text-blood">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
