import { Router, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';

const router = Router();

// Rate limiting for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many login attempts, please try again later' }
});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Registration attempt:', { username, email });

    // Input validation
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        message: 'Username must be at least 3 characters long' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // More lenient password validation for development/testing
    if (!password || password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const message = existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken';
      console.log('Registration failed:', message);
      return res.status(409).json({ message });
    }

    // Create user with secure password hash
    const hashedPassword = await hash(password, 12);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      character: null
    });

    await user.save();
    console.log('User registered successfully:', { userId: user.id, username });

    // Generate JWT token
    const token = sign(
      { 
        userId: user.id,
        username: user.username 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: '1d',
        algorithm: 'HS256'
      }
    );

    // Return success without exposing sensitive data
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'An error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user and select necessary fields
    const user = await User.findOne({ email })
      .select('+password')
      .lean();

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = sign(
      { 
        userId: user._id,
        username: user.username 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: '1d',
        algorithm: 'HS256'
      }
    );

    // Return success without exposing sensitive data
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login' 
    });
  }
});

// Token validation route
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided' 
      });
    }

    const decoded = verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret'
    ) as { userId: string };

    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    res.status(500).json({ 
      message: 'An error occurred while validating token' 
    });
  }
});

export default router;