import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserRepository, StudentRepository, FacultyRepository, DepartmentRepository } from '../repositories/db.repository';
import { SubjectRepository } from '../repositories/academic.repository';
import { ActivityLogRepository } from '../repositories/extra.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { supabase } from '../config/db';

export const AdminController = {
  // Students
  getStudents: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { departmentId, year, search } = req.query;
      const students = await StudentRepository.findAll({
        departmentId: departmentId as string,
        year: year ? parseInt(year as string) : undefined,
        search: search as string,
      });
      return res.status(200).json({ status: 'success', data: students });
    } catch (error) {
      return next(error);
    }
  },

  createStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, roll_number, name, phone, department_id, year, section, profile_image } = req.body;

      // Check email and roll number
      const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existingUser) {
        return next(new BadRequestError('Email already exists'));
      }
      const { data: existingRoll } = await supabase.from('students').select('id').eq('roll_number', roll_number).maybeSingle();
      if (existingRoll) {
        return next(new BadRequestError('Roll number already exists'));
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({ email, password_hash: hashedPassword, role: 'student' })
        .select('id')
        .single();
      
      if (userErr || !user) throw userErr || new Error('Failed to create user');

      // Create Student profile
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          roll_number,
          name,
          phone,
          department_id,
          year,
          section,
          profile_image: profile_image || null
        })
        .select('*')
        .single();

      if (studentErr || !student) {
        // Rollback user
        await supabase.from('users').delete().eq('id', user.id);
        throw studentErr || new Error('Failed to create student profile');
      }

      // Generate Digital ID verification token
      const verificationToken = `token_${roll_number.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`;
      const qrCode = `http://localhost:3000/verify-id/${verificationToken}`;
      
      const { error: cardErr } = await supabase
        .from('digital_id_cards')
        .insert({
          student_id: student.id,
          qr_code: qrCode,
          verification_token: verificationToken
        });

      if (cardErr) {
        // Rollback student and user
        await supabase.from('students').delete().eq('id', student.id);
        await supabase.from('users').delete().eq('id', user.id);
        throw cardErr;
      }

      await ActivityLogRepository.log(req.user?.id || null, 'CREATE_STUDENT', `Created student profile for ${name} (${roll_number})`);

      return res.status(201).json({ status: 'success', data: student });
    } catch (error) {
      return next(error);
    }
  },

  deleteStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const student = await StudentRepository.findById(id);
      if (!student) {
        return next(new NotFoundError('Student not found'));
      }

      await UserRepository.delete(student.user_id); // Cascade will delete student and id card records

      await ActivityLogRepository.log(req.user?.id || null, 'DELETE_STUDENT', `Deleted student ${student.name} (${student.roll_number})`);

      return res.status(200).json({ status: 'success', message: 'Student deleted successfully' });
    } catch (error) {
      return next(error);
    }
  },

  // Faculty
  getFaculty: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyRepository.findAll();
      return res.status(200).json({ status: 'success', data: faculty });
    } catch (error) {
      return next(error);
    }
  },

  createFaculty: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, employee_id, name, department_id, designation } = req.body;

      const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existingUser) {
        return next(new BadRequestError('Email already exists'));
      }
      const { data: existingEmp } = await supabase.from('faculty').select('id').eq('employee_id', employee_id).maybeSingle();
      if (existingEmp) {
        return next(new BadRequestError('Employee ID already exists'));
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Determine role ('hod' if designation contains HOD, else 'faculty')
      const role = designation.toLowerCase().includes('hod') ? 'hod' : 'faculty';

      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({ email, password_hash: hashedPassword, role })
        .select('id')
        .single();
      
      if (userErr || !user) throw userErr || new Error('Failed to create user');

      const { data: faculty, error: facultyErr } = await supabase
        .from('faculty')
        .insert({
          user_id: user.id,
          employee_id,
          name,
          department_id,
          designation
        })
        .select('*')
        .single();

      if (facultyErr || !faculty) {
        await supabase.from('users').delete().eq('id', user.id);
        throw facultyErr || new Error('Failed to create faculty profile');
      }

      // If they are HOD, update the department.hod_id
      if (role === 'hod') {
        const { error: deptErr } = await supabase
          .from('departments')
          .update({ hod_id: faculty.id })
          .eq('id', department_id);

        if (deptErr) {
          await supabase.from('faculty').delete().eq('id', faculty.id);
          await supabase.from('users').delete().eq('id', user.id);
          throw deptErr;
        }
      }

      await ActivityLogRepository.log(req.user?.id || null, 'CREATE_FACULTY', `Created faculty ${name} (${employee_id}) as ${role.toUpperCase()}`);

      return res.status(201).json({ status: 'success', data: faculty });
    } catch (error) {
      return next(error);
    }
  },

  deleteFaculty: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const faculty = await FacultyRepository.findById(id);
      if (!faculty) {
        return next(new NotFoundError('Faculty not found'));
      }

      await UserRepository.delete(faculty.user_id); // Cascade deletes faculty profile

      await ActivityLogRepository.log(req.user?.id || null, 'DELETE_FACULTY', `Deleted faculty ${faculty.name} (${faculty.employee_id})`);

      return res.status(200).json({ status: 'success', message: 'Faculty deleted successfully' });
    } catch (error) {
      return next(error);
    }
  },

  // Departments
  getDepartments: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const departments = await DepartmentRepository.findAll();
      return res.status(200).json({ status: 'success', data: departments });
    } catch (error) {
      return next(error);
    }
  },

  createDepartment: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, code } = req.body;
      const existing = await DepartmentRepository.findByCode(code);
      if (existing) {
        return next(new BadRequestError('Department code already exists'));
      }

      const dept = await DepartmentRepository.create(name, code);
      await ActivityLogRepository.log(req.user?.id || null, 'CREATE_DEPARTMENT', `Created department ${name} (${code})`);

      return res.status(201).json({ status: 'success', data: dept });
    } catch (error) {
      return next(error);
    }
  },

  // Subjects
  getSubjects: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const subjects = await SubjectRepository.findAll();
      return res.status(200).json({ status: 'success', data: subjects });
    } catch (error) {
      return next(error);
    }
  },

  createSubject: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, code, department_id, faculty_id } = req.body;
      const subject = await SubjectRepository.create(name, code, department_id, faculty_id);
      await ActivityLogRepository.log(req.user?.id || null, 'CREATE_SUBJECT', `Created subject ${name} (${code})`);

      return res.status(201).json({ status: 'success', data: subject });
    } catch (error) {
      return next(error);
    }
  },

  // System statistics & Logs
  getSystemStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await DepartmentRepository.getStats();
      return res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      return next(error);
    }
  },

  getActivityLogs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const logs = await ActivityLogRepository.findAll();
      return res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      return next(error);
    }
  }
};
