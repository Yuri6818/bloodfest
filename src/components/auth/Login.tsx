import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing errors when component mounts or unmounts
    return () => clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear error when user starts typing
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // Error is handled by AuthContext
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
        <button 
          type="submit" 
          className="w-full bg-blood text-dark font-bold py-2 px-4 rounded hover:bg-blood-light transition duration-300"
        >
          Login
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
