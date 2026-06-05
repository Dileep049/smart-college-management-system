import { Response, NextFunction } from 'express';
import { FacultyRepository, StudentRepository } from '../repositories/db.repository';
import { SubjectRepository, AttendanceRepository, MarksRepository, LeaveRequestRepository, AnnouncementRepository, StudyMaterialsRepository } from '../repositories/academic.repository';
import { ActivityLogRepository } from '../repositories/extra.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

export const FacultyController = {
  getProfile: async (userId: string) => {
    const faculty = await FacultyRepository.findByUserId(userId);
    if (!faculty) {
      throw new NotFoundError('Faculty profile not found');
    }
    return faculty;
  },

  getDashboardOverview: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      
      const subjects = await SubjectRepository.findByFacultyId(faculty.id);
      const pendingLeaves = await LeaveRequestRepository.findByDepartmentId(faculty.department_id);
      const announcements = await AnnouncementRepository.findAll(faculty.department_id);
      
      // Get total students in department
      const students = await StudentRepository.findAll({ departmentId: faculty.department_id });

      return res.status(200).json({
        status: 'success',
        data: {
          profile: faculty,
          stats: {
            subjectsCount: subjects.length,
            studentsCount: students.length,
            pendingLeavesCount: pendingLeaves.filter((l: any) => l.status === 'pending').length
          },
          subjects,
          pendingLeaves: pendingLeaves.slice(0, 5),
          announcements: announcements.slice(0, 5)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  getSubjects: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const subjects = await SubjectRepository.findByFacultyId(faculty.id);
      return res.status(200).json({ status: 'success', data: subjects });
    } catch (error) {
      return next(error);
    }
  },

  getStudentsBySubject: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { subjectId } = req.params;

      const subject = await SubjectRepository.findById(subjectId);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }

      // Verify faculty teaches this subject
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      // Fetch students in subject's department
      const students = await StudentRepository.findAll({ departmentId: subject.department_id });
      return res.status(200).json({ status: 'success', data: students });
    } catch (error) {
      return next(error);
    }
  },

  markAttendance: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { subject_id, attendance_date, records } = req.body;

      const subject = await SubjectRepository.findById(subject_id);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      await AttendanceRepository.markAttendance(subject_id, attendance_date, records);
      await ActivityLogRepository.log(req.user!.id, 'MARK_ATTENDANCE', `Attendance marked for subject ${subject.code} on ${attendance_date}`);

      return res.status(200).json({ status: 'success', message: 'Attendance marked successfully' });
    } catch (error) {
      return next(error);
    }
  },

  getAttendanceLogs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { subjectId } = req.params;
      const { date } = req.query;

      if (!date) {
        return next(new BadRequestError('Date query param (YYYY-MM-DD) is required'));
      }

      const subject = await SubjectRepository.findById(subjectId);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      const logs = await AttendanceRepository.getFacultySubjectLogs(subjectId, date as string);
      return res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      return next(error);
    }
  },

  uploadMarks: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { subject_id, exam_type, records } = req.body;

      const subject = await SubjectRepository.findById(subject_id);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      await MarksRepository.uploadMarks(subject_id, exam_type, records);
      await ActivityLogRepository.log(req.user!.id, 'UPLOAD_MARKS', `Marks uploaded for subject ${subject.code} (${exam_type})`);

      return res.status(200).json({ status: 'success', message: 'Marks uploaded successfully' });
    } catch (error) {
      return next(error);
    }
  },

  getMarksLogs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { subjectId } = req.params;
      const { examType } = req.query;

      if (!examType) {
        return next(new BadRequestError('examType query parameter is required'));
      }

      const subject = await SubjectRepository.findById(subjectId);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      const logs = await MarksRepository.getSubjectMarksReport(subjectId, examType as string);
      return res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      return next(error);
    }
  },

  getLeaveRequests: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const leaves = await LeaveRequestRepository.findByDepartmentId(faculty.department_id);
      return res.status(200).json({ status: 'success', data: leaves });
    } catch (error) {
      return next(error);
    }
  },

  approveLeave: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { leaveId } = req.params;
      const { status } = req.body; // 'approved' | 'rejected'

      const updated = await LeaveRequestRepository.updateStatus(leaveId, status, faculty.id);
      await ActivityLogRepository.log(req.user!.id, 'LEAVE_DECISION', `Leave application ID ${leaveId} was ${status}`);

      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return next(error);
    }
  },

  postAnnouncement: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { title, description } = req.body;
      
      const post = await AnnouncementRepository.create(title, description, faculty.department_id, req.user!.id);
      await ActivityLogRepository.log(req.user!.id, 'POST_ANNOUNCEMENT', `Posted announcement "${title}" for department ${faculty.department_code}`);

      return res.status(201).json({ status: 'success', data: post });
    } catch (error) {
      return next(error);
    }
  },

  uploadStudyMaterial: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const faculty = await FacultyController.getProfile(req.user!.id);
      const { title, file_url, subject_id } = req.body;

      const subject = await SubjectRepository.findById(subject_id);
      if (!subject) {
        return next(new NotFoundError('Subject not found'));
      }
      if (subject.faculty_id !== faculty.id) {
        return next(new ForbiddenError('You do not teach this subject'));
      }

      const material = await StudyMaterialsRepository.create(title, file_url, subject_id, faculty.id);
      await ActivityLogRepository.log(req.user!.id, 'UPLOAD_NOTES', `Notes uploaded for subject ${subject.code}`);

      return res.status(201).json({ status: 'success', data: material });
    } catch (error) {
      return next(error);
    }
  }
};
