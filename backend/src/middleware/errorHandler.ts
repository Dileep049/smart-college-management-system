import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught in global handler:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle Zod validation errors format if any (handled separately in validation middleware normally)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: (err as any).errors,
    });
  }

  // Default server error
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred.' 
      : err.message,
  });
};
