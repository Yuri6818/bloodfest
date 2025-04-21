import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  username: string;
}

interface TokenError extends Error {
  name: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('_id username').lean();
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    const tokenError = error as TokenError;
    
    if (tokenError.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    if (tokenError.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}; 