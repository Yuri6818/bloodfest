import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details || {}
    })
  });
};

// Helper function to create errors with status codes
export const createError = (message: string, statusCode: number, details?: any): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};

// Common error types
export const notFound = (resource: string = 'Resource') => 
  createError(`${resource} not found`, 404);

export const badRequest = (message: string = 'Bad request') => 
  createError(message, 400);

export const unauthorized = (message: string = 'Unauthorized') => 
  createError(message, 401);

export const forbidden = (message: string = 'Forbidden') => 
  createError(message, 403);

export const conflict = (message: string = 'Resource already exists') => 
  createError(message, 409);

export const serverError = (message: string = 'Internal Server Error') => 
  createError(message, 500);