import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, error, clearError, useMockAuth, setUseMockAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing errors when component mounts or unmounts
    return () => clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear auth errors when user starts typing
    setValidationError(null); // Clear validation errors
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords don't match");
      return false;
    }

    if (formData.username.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.email, formData.password, formData.username);
      navigate('/create-character');
    } catch (err: any) {
      // Error is handled by AuthContext
      console.error('Registration failed');
    }
  };

  const toggleMockAuth = () => {
    setUseMockAuth(!useMockAuth);
    clearError();
    setValidationError(null);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-3xl font-gothic text-blood-light mb-6">Register</h2>
      {(error || validationError) && (
        <div className="bg-blood/20 border border-blood text-blood-light p-3 rounded mb-4">
          {error || validationError}
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
            className="w-full px-3 py-2 bg-dark-darker border border-blood/20 rounded text-light-darker focus:outline-none focus:border-blood"
            required
          />
        </div>
        <div>
          <label htmlFor="username" className="block mb-1">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-darker border border-blood/20 rounded text-light-darker focus:outline-none focus:border-blood"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-darker border border-blood/20 rounded text-light-darker focus:outline-none focus:border-blood"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-darker border border-blood/20 rounded text-light-darker focus:outline-none focus:border-blood"
            required
          />
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
              ? "Using mock registration (backend unavailable)" 
              : "Try to use real backend registration (may fail)"}
          </label>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blood text-dark font-bold py-2 px-4 rounded hover:bg-blood-light transition duration-300"
        >
          {useMockAuth ? "Register (Mock)" : "Register"}
        </button>
        <p className="text-center text-light-darker">
          Already have an account?{' '}
          <Link to="/login" className="text-blood-light hover:text-blood">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
