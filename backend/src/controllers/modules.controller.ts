import { Response, NextFunction } from 'express';
import { FacultyRepository, DepartmentRepository, StudentRepository } from '../repositories/db.repository';
import { SubjectRepository } from '../repositories/academic.repository';
import { PlacementRepository, EventRepository, ActivityLogRepository } from '../repositories/extra.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { supabase } from '../config/db';

// 1. HOD Controller
export const HODController = {
  getProfile: async (userId: string) => {
    const faculty = await FacultyRepository.findByUserId(userId);
    if (!faculty || !faculty.designation.toLowerCase().includes('hod')) {
      throw new ForbiddenError('Access restricted to Department Head (HOD)');
    }
    return faculty;
  },

  getDashboardOverview: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const hod = await HODController.getProfile(req.user!.id);
      
      const stats = await DepartmentRepository.getStats(hod.department_id);
      
      // Fetch department faculty list
      const { data: facultyList, error: facErr } = await supabase
        .from('faculty')
        .select('id, name, employee_id, designation')
        .eq('department_id', hod.department_id);
      if (facErr) throw facErr;

      // Fetch all department subjects
      const { data: subjects, error: subjErr } = await supabase
        .from('subjects')
        .select('id, faculty_id')
        .eq('department_id', hod.department_id);
      if (subjErr) throw subjErr;

      const facultyListWithCounts = facultyList?.map(f => {
        const count = subjects?.filter(s => s.faculty_id === f.id).length || 0;
        return {
          id: f.id,
          name: f.name,
          employee_id: f.employee_id,
          designation: f.designation,
          subjects_count: count
        };
      }) || [];

      // Fetch all department subjects details (for attendance logs mapping)
      const { data: subDetails } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('department_id', hod.department_id);

      const subIds = subDetails?.map(s => s.id) || [];
      const { data: attendanceLogs } = subIds.length > 0
        ? await supabase.from('attendance').select('id, subject_id, status').in('subject_id', subIds)
        : { data: [] };

      const attendanceReport = subDetails?.map(s => {
        const logs = attendanceLogs?.filter(a => a.subject_id === s.id) || [];
        const present = logs.filter(a => a.status === 'present').length;
        return {
          subject_name: s.name,
          subject_code: s.code,
          total_attendance_records: logs.length,
          total_present: present
        };
      }) || [];

      return res.status(200).json({
        status: 'success',
        data: {
          profile: hod,
          stats,
          facultyList: facultyListWithCounts,
          attendanceReport
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  getDepartmentStudents: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const hod = await HODController.getProfile(req.user!.id);
      const students = await StudentRepository.findAll({ departmentId: hod.department_id });
      return res.status(200).json({ status: 'success', data: students });
    } catch (error) {
      return next(error);
    }
  },

  // Timetable
  getTimetable: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const hod = await HODController.getProfile(req.user!.id);
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('department_id', hod.department_id);
        
      if (error) throw error;
      return res.status(200).json({ status: 'success', data: data || [] });
    } catch (error) {
      return next(error);
    }
  },
 
  saveTimetable: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const hod = await HODController.getProfile(req.user!.id);
      const { day, periods } = req.body; // periods: [{ time: "09:00", subject_id: "uuid" }]

      const { data: resInsert, error } = await supabase
        .from('timetables')
        .upsert({
          department_id: hod.department_id,
          day_of_week: day,
          schedule: periods
        }, { onConflict: 'department_id,day_of_week' })
        .select('*')
        .single();

      if (error) throw error;

      await ActivityLogRepository.log(req.user!.id, 'UPDATE_TIMETABLE', `HOD updated timetable for ${day}`);

      return res.status(200).json({ status: 'success', data: resInsert });
    } catch (error) {
      return next(error);
    }
  }
};

// 2. Placement Controller
export const PlacementController = {
  createPosting: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { company_name, role, package: packageName, eligibility, deadline } = req.body;
      const posting = await PlacementRepository.create(
        company_name,
        role,
        packageName,
        eligibility,
        deadline,
        req.user!.id
      );

      await ActivityLogRepository.log(req.user!.id, 'CREATE_PLACEMENT', `Created job posting for ${company_name} - ${role}`);

      return res.status(201).json({ status: 'success', data: posting });
    } catch (error) {
      return next(error);
    }
  },

  getAllPostings: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const postings = await PlacementRepository.findAll();
      return res.status(200).json({ status: 'success', data: postings });
    } catch (error) {
      return next(error);
    }
  },

  getApplications: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { placementId } = req.query;
      const applications = await PlacementRepository.getApplications(placementId as string);
      return res.status(200).json({ status: 'success', data: applications });
    } catch (error) {
      return next(error);
    }
  },

  updateApplicationStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body; // 'applied', 'shortlisted', 'selected', 'rejected'

      const updated = await PlacementRepository.updateStatus(applicationId, status);
      await ActivityLogRepository.log(req.user!.id, 'PLACEMENT_DECISION', `Updated placement application ID ${applicationId} to ${status}`);

      return res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      return next(error);
    }
  }
};

// 3. Event Controller
export const EventController = {
  createEvent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, event_type, event_date, location, organizer, registration_deadline } = req.body;
      const event = await EventRepository.create(
        title,
        description,
        event_type,
        event_date,
        location,
        organizer,
        registration_deadline
      );

      await ActivityLogRepository.log(req.user!.id, 'CREATE_EVENT', `Created event: ${title}`);

      return res.status(201).json({ status: 'success', data: event });
    } catch (error) {
      return next(error);
    }
  },

  getAllEvents: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const events = await EventRepository.findAll();
      return res.status(200).json({ status: 'success', data: events });
    } catch (error) {
      return next(error);
    }
  },

  getRegistrations: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const registrations = await EventRepository.getRegistrations(eventId);
      return res.status(200).json({ status: 'success', data: registrations });
    } catch (error) {
      return next(error);
    }
  },

  issueCertificate: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const { student_id } = req.body;
      
      const certificateUrl = `http://localhost:5000/api/students/certificates/${eventId}/download`;
      const cert = await EventRepository.issueCertificate(student_id, eventId, certificateUrl);

      await ActivityLogRepository.log(req.user!.id, 'ISSUE_CERTIFICATE', `Issued certificate for event ID ${eventId} to student ID ${student_id}`);

      return res.status(201).json({ status: 'success', data: cert });
    } catch (error) {
      return next(error);
    }
  }
};


