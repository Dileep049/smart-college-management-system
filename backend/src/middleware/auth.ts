import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_access_secret_key_extremely_long_random_string_12345';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: 'student' | 'faculty' | 'hod' | 'admin' | 'placement_officer';
      };

      req.user = decoded;
      return next();
    } catch (err) {
      return next(new UnauthorizedError('Invalid or expired token. Please log in again.'));
    }
  } catch (error) {
    return next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('You are not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }

    return next();
  };
};
