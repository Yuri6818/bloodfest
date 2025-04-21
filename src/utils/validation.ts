/**
 * Validation utility functions for form validation
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 chars, 1 uppercase, 1 lowercase, 1 number
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
};

// Username validation - 3-20 chars, alphanumeric and underscore only
export const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

// Get password strength (0-4)
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(4, strength);
};

// Format validation error messages
export const getValidationErrorMessage = (field: string, value: string): string | null => {
  switch (field) {
    case 'email':
      return isValidEmail(value) ? null : 'Please enter a valid email address';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
      if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
      if (!/\d/.test(value)) return 'Password must include a number';
      return null;
    case 'username':
      if (!value) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (value.length > 20) return 'Username must be less than 20 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers and underscores';
      return null;
    default:
      return null;
  }
};
