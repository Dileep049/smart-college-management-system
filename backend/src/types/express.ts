import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'faculty' | 'hod' | 'admin' | 'placement_officer';
  };
}
