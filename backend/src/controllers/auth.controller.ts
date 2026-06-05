import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db';
import { UserRepository, StudentRepository, FacultyRepository, DepartmentRepository } from '../repositories/db.repository';
import { ActivityLogRepository } from '../repositories/extra.repository';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_access_secret_key_extremely_long_random_string_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development_jwt_refresh_secret_key_extremely_long_random_string_12345';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return next(new UnauthorizedError('Invalid email or password'));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return next(new UnauthorizedError('Invalid email or password'));
      }

      // Generate Access Token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY as any }
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRY as any }
      );

      // Log login activity
      await ActivityLogRepository.log(user.id, 'USER_LOGIN', `User ${user.email} logged in successfully.`);

      return res.status(200).json({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  me: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Not authenticated'));
      }

      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      let profile: any = null;

      if (user.role === 'student') {
        profile = await StudentRepository.findByUserId(user.id);
      } else if (user.role === 'faculty' || user.role === 'hod') {
        profile = await FacultyRepository.findByUserId(user.id);
      } else if (user.role === 'placement_officer') {
        // Placement profile
        const { data: po, error: poError } = await supabase
          .from('placement_officers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (poError) throw poError;
        profile = po || null;
      }

      return res.status(200).json({
        status: 'success',
        data: {
          user,
          profile
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await UserRepository.findByEmail(email);
      
      // In production, we send a link. For now, simulate success
      if (user) {
        console.log(`[PASSWORD_RESET_LINK] Simulated reset link for: ${email}`);
        await ActivityLogRepository.log(user.id, 'PASSWORD_RESET_REQUEST', `Reset link requested for ${email}`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent.'
      });
    } catch (error) {
      return next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      
      // For demonstration, the token is simply the user's email or a JWT
      let userId: string;
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
        userId = decoded.id;
      } catch (err) {
        // Fallback for simple testing: token is treated as an email
        const user = await UserRepository.findByEmail(token);
        if (!user) {
          return next(new BadRequestError('Invalid or expired reset token'));
        }
        userId = user.id;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await UserRepository.updatePassword(userId, hashedPassword);
      await ActivityLogRepository.log(userId, 'PASSWORD_RESET_SUCCESS', `Password reset successfully`);

      return res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully.'
      });
    } catch (error) {
      return next(error);
    }
  }
};

