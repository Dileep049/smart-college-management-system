import { z } from 'zod';

// Helper for UUID validation
const uuidSchema = z.string().uuid();

// 1. Auth Schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

// 2. Attendance Schema
export const markAttendanceSchema = z.object({
  body: z.object({
    subject_id: uuidSchema,
    attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    records: z.array(
      z.object({
        student_id: uuidSchema,
        status: z.enum(['present', 'absent', 'late']),
      })
    ).min(1, 'At least one student record is required'),
  }),
});

// 3. Marks Schema
export const uploadMarksSchema = z.object({
  body: z.object({
    subject_id: uuidSchema,
    exam_type: z.string().min(2, 'Exam type is required'),
    records: z.array(
      z.object({
        student_id: uuidSchema,
        marks: z.number().min(0),
        total_marks: z.number().positive(),
      })
    ).min(1, 'At least one mark record is required'),
  }),
});

// 4. Leave Request Schema
export const leaveRequestSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters long'),
    from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
});

export const leaveApprovalSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
  }),
});

// 5. Announcement Schema
export const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    department_id: uuidSchema.optional().nullable(),
  }),
});

// 6. Placement Schema
export const placementSchema = z.object({
  body: z.object({
    company_name: z.string().min(2, 'Company name is required'),
    role: z.string().min(2, 'Role designation is required'),
    package: z.string().min(2, 'Package details are required'),
    eligibility: z.string().min(5, 'Eligibility details are required'),
    deadline: z.string().datetime('Deadline must be a valid ISO Date Time string'),
  }),
});

export const placementApplicationSchema = z.object({
  body: z.object({
    placement_id: uuidSchema,
    resume_url: z.string().url('Invalid resume URL'),
  }),
});

// 7. Event Schema
export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    event_type: z.enum(['club_registration', 'hackathon', 'workshop', 'technical', 'cultural']),
    event_date: z.string().datetime('Event date must be a valid ISO Date Time string'),
    location: z.string().min(2, 'Location is required'),
    organizer: z.string().min(2, 'Organizer is required'),
    registration_deadline: z.string().datetime('Registration deadline must be a valid ISO Date Time string'),
  }),
});

// 8. Admin Management Schemas
export const createStudentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    roll_number: z.string().min(3),
    name: z.string().min(2),
    phone: z.string(),
    department_id: uuidSchema,
    year: z.number().int().min(1).max(5),
    section: z.string().max(10),
    profile_image: z.string().optional().nullable(),
  }),
});

export const createFacultySchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    employee_id: z.string().min(3),
    name: z.string().min(2),
    department_id: uuidSchema,
    designation: z.string().min(2),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    department_id: uuidSchema,
    faculty_id: uuidSchema,
  }),
});
