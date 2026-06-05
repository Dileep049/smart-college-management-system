export type UserRole = 'student' | 'faculty' | 'hod' | 'admin' | 'placement_officer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_id?: string | null;
  hod_name?: string | null;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  roll_number: string;
  name: string;
  phone: string;
  department_id: string;
  department_name: string;
  department_code: string;
  year: number;
  section: string;
  profile_image?: string | null;
  created_at: string;
}

export interface FacultyProfile {
  id: string;
  user_id: string;
  employee_id: string;
  name: string;
  department_id: string;
  department_name: string;
  department_code: string;
  designation: string;
  created_at: string;
}

export interface PlacementOfficerProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name?: string;
  department_code?: string;
  faculty_id: string;
  faculty_name?: string;
}

export interface AttendanceSummary {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  total_classes: number;
  attended_classes: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Mark {
  id: string;
  exam_type: string;
  marks: number;
  total_marks: number;
  subject_name: string;
  subject_code: string;
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  year?: number;
  section?: string;
  reason: string;
  from_date: string;
  to_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by_name?: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  department_id?: string | null;
  department_code?: string | null;
  created_by: string;
  creator_email?: string;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  file_url: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  faculty_name?: string;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'club_registration' | 'hackathon' | 'workshop' | 'technical' | 'cultural';
  event_date: string;
  location: string;
  organizer: string;
  registration_deadline: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  registered_at: string;
  title?: string;
  event_date?: string;
  location?: string;
  event_type?: string;
}

export interface EventCertificate {
  id: string;
  student_id: string;
  event_id: string;
  event_title?: string;
  certificate_url: string;
  issued_at: string;
}

export interface PlacementPosting {
  id: string;
  company_name: string;
  role: string;
  package: string;
  eligibility: string;
  deadline: string;
  created_at: string;
}

export interface PlacementApplication {
  id: string;
  placement_id: string;
  student_id: string;
  student_name?: string;
  roll_number?: string;
  department_code?: string;
  company_name?: string;
  role?: string;
  package?: string;
  resume_url: string;
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected';
  applied_at: string;
}

export interface DigitalIDCard {
  id: string;
  student_id: string;
  qr_code: string;
  verification_token: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_role?: UserRole | null;
  action: string;
  details?: string | null;
  created_at: string;
}
