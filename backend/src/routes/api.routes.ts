import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { StudentController } from '../controllers/student.controller';
import { FacultyController } from '../controllers/faculty.controller';
import { HODController, PlacementController, EventController } from '../controllers/modules.controller';
import { DigitalIDCardRepository } from '../repositories/extra.repository';
import { NotFoundError } from '../utils/errors';

import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createStudentSchema,
  createFacultySchema,
  createDepartmentSchema,
  createSubjectSchema,
  markAttendanceSchema,
  uploadMarksSchema,
  leaveRequestSchema,
  leaveApprovalSchema,
  announcementSchema,
  placementSchema,
  placementApplicationSchema,
  eventSchema
} from '../validators/schemas';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.post('/auth/login', validate(loginSchema), AuthController.login);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// Public verification endpoint for QR Scan
router.get('/public/verify-id/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const cardData = await DigitalIDCardRepository.findByVerificationToken(token);
    if (!cardData) {
      return next(new NotFoundError('ID Card token is invalid or expired.'));
    }
    return res.status(200).json({ status: 'success', data: cardData });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// SECURE USER ENDPOINTS (me)
// ==========================================
router.get('/auth/me', protect, AuthController.me);

// ==========================================
// ADMIN MODULE
// ==========================================
router.get('/admin/stats', protect, restrictTo('admin'), AdminController.getSystemStats);
router.get('/admin/logs', protect, restrictTo('admin'), AdminController.getActivityLogs);

router.get('/admin/students', protect, restrictTo('admin'), AdminController.getStudents);
router.post('/admin/students', protect, restrictTo('admin'), validate(createStudentSchema), AdminController.createStudent);
router.delete('/admin/students/:id', protect, restrictTo('admin'), AdminController.deleteStudent);

router.get('/admin/faculty', protect, restrictTo('admin'), AdminController.getFaculty);
router.post('/admin/faculty', protect, restrictTo('admin'), validate(createFacultySchema), AdminController.createFaculty);
router.delete('/admin/faculty/:id', protect, restrictTo('admin'), AdminController.deleteFaculty);

router.get('/admin/departments', protect, restrictTo('admin'), AdminController.getDepartments);
router.post('/admin/departments', protect, restrictTo('admin'), validate(createDepartmentSchema), AdminController.createDepartment);

router.get('/admin/subjects', protect, restrictTo('admin'), AdminController.getSubjects);
router.post('/admin/subjects', protect, restrictTo('admin'), validate(createSubjectSchema), AdminController.createSubject);

// ==========================================
// STUDENT MODULE
// ==========================================
router.get('/student/dashboard', protect, restrictTo('student'), StudentController.getDashboardOverview);
router.get('/student/attendance', protect, restrictTo('student'), StudentController.getAttendance);
router.get('/student/marks', protect, restrictTo('student'), StudentController.getMarks);
router.get('/student/transcript', protect, restrictTo('student'), StudentController.downloadTranscript);
router.get('/student/leaves', protect, restrictTo('student'), StudentController.getLeaveRequests);
router.post('/student/leaves', protect, restrictTo('student'), validate(leaveRequestSchema), StudentController.applyLeave);
router.get('/student/study-materials', protect, restrictTo('student'), StudentController.getStudyMaterials);
router.get('/student/announcements', protect, restrictTo('student'), StudentController.getAnnouncements);
router.get('/student/placements', protect, restrictTo('student'), StudentController.getPlacements);
router.post('/student/placements/apply', protect, restrictTo('student'), validate(placementApplicationSchema), StudentController.applyPlacement);
router.get('/student/events', protect, restrictTo('student'), StudentController.getEvents);
router.post('/student/events/register', protect, restrictTo('student'), StudentController.registerEvent);
router.get('/student/certificates/:eventId/download', protect, restrictTo('student'), StudentController.downloadCertificate);
router.get('/student/id-card', protect, restrictTo('student'), StudentController.getIDCard);

// ==========================================
// FACULTY & HOD COMMON MODULE
// ==========================================
router.get('/faculty/dashboard', protect, restrictTo('faculty', 'hod'), FacultyController.getDashboardOverview);
router.get('/faculty/subjects', protect, restrictTo('faculty', 'hod'), FacultyController.getSubjects);
router.get('/faculty/subjects/:subjectId/students', protect, restrictTo('faculty', 'hod'), FacultyController.getStudentsBySubject);
router.post('/faculty/attendance', protect, restrictTo('faculty', 'hod'), validate(markAttendanceSchema), FacultyController.markAttendance);
router.get('/faculty/attendance/:subjectId', protect, restrictTo('faculty', 'hod'), FacultyController.getAttendanceLogs);
router.post('/faculty/marks', protect, restrictTo('faculty', 'hod'), validate(uploadMarksSchema), FacultyController.uploadMarks);
router.get('/faculty/marks/:subjectId', protect, restrictTo('faculty', 'hod'), FacultyController.getMarksLogs);
router.get('/faculty/leaves', protect, restrictTo('faculty', 'hod'), FacultyController.getLeaveRequests);
router.post('/faculty/leaves/:leaveId/approve', protect, restrictTo('faculty', 'hod'), validate(leaveApprovalSchema), FacultyController.approveLeave);
router.post('/faculty/announcements', protect, restrictTo('faculty', 'hod'), validate(announcementSchema), FacultyController.postAnnouncement);
router.post('/faculty/study-materials', protect, restrictTo('faculty', 'hod'), FacultyController.uploadStudyMaterial);

// ==========================================
// HOD SPECIFIC MODULE
// ==========================================
router.get('/hod/dashboard', protect, restrictTo('hod'), HODController.getDashboardOverview);
router.get('/hod/students', protect, restrictTo('hod'), HODController.getDepartmentStudents);
router.get('/hod/timetable', protect, restrictTo('hod'), HODController.getTimetable);
router.post('/hod/timetable', protect, restrictTo('hod'), HODController.saveTimetable);

// ==========================================
// PLACEMENT OFFICER MODULE
// ==========================================
router.post('/placements', protect, restrictTo('placement_officer', 'admin'), validate(placementSchema), PlacementController.createPosting);
router.get('/placements/postings', protect, PlacementController.getAllPostings); // shared
router.get('/placements/applications', protect, restrictTo('placement_officer', 'admin'), PlacementController.getApplications);
router.patch('/placements/applications/:applicationId', protect, restrictTo('placement_officer', 'admin'), PlacementController.updateApplicationStatus);

// ==========================================
// EVENT MANAGEMENT MODULE
// ==========================================
router.post('/events', protect, restrictTo('admin', 'faculty', 'hod'), validate(eventSchema), EventController.createEvent);
router.get('/events', protect, EventController.getAllEvents); // shared
router.get('/events/:eventId/registrations', protect, restrictTo('admin', 'faculty', 'hod'), EventController.getRegistrations);
router.post('/events/:eventId/issue-certificate', protect, restrictTo('admin', 'faculty', 'hod'), EventController.issueCertificate);

export default router;
