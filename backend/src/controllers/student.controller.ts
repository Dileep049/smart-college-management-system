import { Response, NextFunction } from 'express';
import { StudentRepository } from '../repositories/db.repository';
import { AttendanceRepository, MarksRepository, LeaveRequestRepository, AnnouncementRepository, StudyMaterialsRepository } from '../repositories/academic.repository';
import { PlacementRepository, EventRepository, DigitalIDCardRepository, ActivityLogRepository } from '../repositories/extra.repository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { PDFService } from '../services/pdf.service';

export const StudentController = {
  // Helper to fetch the student profile linked to user
  getProfile: async (userId: string) => {
    const student = await StudentRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }
    return student;
  },

  getDashboardOverview: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      
      const attendance = await AttendanceRepository.getStudentAttendanceSummary(student.id);
      const marks = await MarksRepository.getStudentMarks(student.id);
      const announcements = await AnnouncementRepository.findAll(student.department_id);
      const placements = await PlacementRepository.findAll();
      const registeredEvents = await EventRepository.getStudentRegistrations(student.id);
      
      // Calculate overall attendance percentage
      let totalClasses = 0;
      let attendedClasses = 0;
      attendance.forEach((item: any) => {
        totalClasses += item.total_classes;
        attendedClasses += item.attended_classes;
      });
      const overallAttendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

      return res.status(200).json({
        status: 'success',
        data: {
          profile: student,
          stats: {
            overallAttendance,
            marksCount: marks.length,
            eventsRegisteredCount: registeredEvents.length,
            placementsCount: placements.length
          },
          announcements: announcements.slice(0, 5),
          attendance: attendance.slice(0, 5),
          marks: marks.slice(0, 5)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  getAttendance: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const summary = await AttendanceRepository.getStudentAttendanceSummary(student.id);
      return res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
      return next(error);
    }
  },

  getMarks: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const marks = await MarksRepository.getStudentMarks(student.id);
      return res.status(200).json({ status: 'success', data: marks });
    } catch (error) {
      return next(error);
    }
  },

  downloadTranscript: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const marks = await MarksRepository.getStudentMarks(student.id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=transcript_${student.roll_number}.pdf`);

      PDFService.generateTranscript(
        student.name,
        student.roll_number,
        student.department_name,
        marks,
        res
      );
    } catch (error) {
      return next(error);
    }
  },

  getLeaveRequests: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const leaves = await LeaveRequestRepository.findByStudentId(student.id);
      return res.status(200).json({ status: 'success', data: leaves });
    } catch (error) {
      return next(error);
    }
  },

  applyLeave: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const { reason, from_date, to_date } = req.body;
      const leave = await LeaveRequestRepository.create(student.id, reason, from_date, to_date);
      
      await ActivityLogRepository.log(req.user!.id, 'APPLY_LEAVE', `Student applied leave from ${from_date} to ${to_date}`);

      return res.status(201).json({ status: 'success', data: leave });
    } catch (error) {
      return next(error);
    }
  },

  getStudyMaterials: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const materials = await StudyMaterialsRepository.findByStudentId(student.id);
      return res.status(200).json({ status: 'success', data: materials });
    } catch (error) {
      return next(error);
    }
  },

  getAnnouncements: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const announcements = await AnnouncementRepository.findAll(student.department_id);
      return res.status(200).json({ status: 'success', data: announcements });
    } catch (error) {
      return next(error);
    }
  },

  getPlacements: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const placements = await PlacementRepository.findAll();
      const applications = await PlacementRepository.getStudentApplications(student.id);
      return res.status(200).json({ 
        status: 'success', 
        data: { placements, applications } 
      });
    } catch (error) {
      return next(error);
    }
  },

  applyPlacement: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const { placement_id, resume_url } = req.body;
      const app = await PlacementRepository.apply(placement_id, student.id, resume_url);
      
      await ActivityLogRepository.log(req.user!.id, 'APPLY_PLACEMENT', `Applied for placement ID ${placement_id}`);

      return res.status(201).json({ status: 'success', data: app });
    } catch (error) {
      return next(error);
    }
  },

  getEvents: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const events = await EventRepository.findAll();
      const registrations = await EventRepository.getStudentRegistrations(student.id);
      const certificates = await EventRepository.getCertificates(student.id);
      
      return res.status(200).json({
        status: 'success',
        data: { events, registrations, certificates }
      });
    } catch (error) {
      return next(error);
    }
  },

  registerEvent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const { event_id } = req.body;

      const event = await EventRepository.findById(event_id);
      if (!event) {
        return next(new NotFoundError('Event not found'));
      }

      if (new Date(event.registration_deadline) < new Date()) {
        return next(new BadRequestError('Registration deadline has passed'));
      }

      const reg = await EventRepository.register(event_id, student.id);
      await ActivityLogRepository.log(req.user!.id, 'EVENT_REGISTER', `Registered for event ${event.title}`);

      return res.status(201).json({ status: 'success', data: reg });
    } catch (error) {
      return next(error);
    }
  },

  downloadCertificate: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const { eventId } = req.params;

      const event = await EventRepository.findById(eventId);
      if (!event) {
        return next(new NotFoundError('Event not found'));
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate_${event.title.replace(/\s+/g, '_')}.pdf`);

      PDFService.generateCertificate(student.name, event.title, res);
    } catch (error) {
      return next(error);
    }
  },

  getIDCard: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const student = await StudentController.getProfile(req.user!.id);
      const card = await DigitalIDCardRepository.findByStudentId(student.id);
      if (!card) {
        return next(new NotFoundError('Digital ID card not found'));
      }
      return res.status(200).json({ status: 'success', data: { profile: student, card } });
    } catch (error) {
      return next(error);
    }
  }
};
