-- Database Seeding for Smart College Management System
-- All user accounts have the password: password123 (bcrypt: $2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a)

-- Clear existing data
TRUNCATE TABLE activity_logs, digital_id_cards, placement_applications, placements, certificates, event_registrations, events, study_materials, announcements, leave_requests, marks, attendance, subjects, placement_officers, students, faculty, departments, users CASCADE;

-- 1. Insert Users
-- Admin
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0e0a0e0-0000-0000-0000-000000000001', 'admin@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'admin');

-- Placement Officer
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0e0a0e0-0000-0000-0000-000000000002', 'placement@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'placement_officer');

-- HODs (Faculty users)
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0e0a0e0-0000-0000-0000-000000000003', 'cse.hod@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'hod'),
('a0e0a0e0-0000-0000-0000-000000000004', 'ece.hod@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'hod');

-- Faculty
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0e0a0e0-0000-0000-0000-000000000005', 'cse.faculty1@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'faculty'),
('a0e0a0e0-0000-0000-0000-000000000006', 'cse.faculty2@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'faculty'),
('a0e0a0e0-0000-0000-0000-000000000007', 'ece.faculty1@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'faculty');

-- Students
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0e0a0e0-0000-0000-0000-000000000010', 'student1@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'student'),
('a0e0a0e0-0000-0000-0000-000000000011', 'student2@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'student'),
('a0e0a0e0-0000-0000-0000-000000000012', 'student3@college.edu', '$2a$10$mC3msf6B65ZpKzI.G7JtIeD41w.fR.JvG4zOpxgB0s75c.V67Xo3a', 'student');

-- 2. Insert Departments
INSERT INTO departments (id, name, code) VALUES 
('d0e0a0e0-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE'),
('d0e0a0e0-0000-0000-0000-000000000002', 'Electronics & Communication Engineering', 'ECE');

-- 3. Insert Faculty (with HOD designation)
INSERT INTO faculty (id, user_id, employee_id, name, department_id, designation) VALUES 
('f0e0a0e0-0000-0000-0000-000000000001', 'a0e0a0e0-0000-0000-0000-000000000003', 'EMP_CSE_01', 'Dr. Alan Turing', 'd0e0a0e0-0000-0000-0000-000000000001', 'HOD & Professor'),
('f0e0a0e0-0000-0000-0000-000000000002', 'a0e0a0e0-0000-0000-0000-000000000004', 'EMP_ECE_01', 'Dr. Claude Shannon', 'd0e0a0e0-0000-0000-0000-000000000002', 'HOD & Professor'),
('f0e0a0e0-0000-0000-0000-000000000003', 'a0e0a0e0-0000-0000-0000-000000000005', 'EMP_CSE_02', 'Prof. Grace Hopper', 'd0e0a0e0-0000-0000-0000-000000000001', 'Assistant Professor'),
('f0e0a0e0-0000-0000-0000-000000000004', 'a0e0a0e0-0000-0000-0000-000000000006', 'EMP_CSE_03', 'Dr. Donald Knuth', 'd0e0a0e0-0000-0000-0000-000000000001', 'Associate Professor'),
('f0e0a0e0-0000-0000-0000-000000000005', 'a0e0a0e0-0000-0000-0000-000000000007', 'EMP_ECE_02', 'Prof. Heinrich Hertz', 'd0e0a0e0-0000-0000-0000-000000000002', 'Assistant Professor');

-- Update HOD references in Departments
UPDATE departments SET hod_id = 'f0e0a0e0-0000-0000-0000-000000000001' WHERE code = 'CSE';
UPDATE departments SET hod_id = 'f0e0a0e0-0000-0000-0000-000000000002' WHERE code = 'ECE';

-- 4. Insert Placement Officer Profile
INSERT INTO placement_officers (id, user_id, name, phone) VALUES
('b0e0a0e0-0000-0000-0000-000000000001', 'a0e0a0e0-0000-0000-0000-000000000002', 'Mr. Richard Branson', '+15550199');

-- 5. Insert Students
INSERT INTO students (id, user_id, roll_number, name, phone, department_id, year, section, profile_image) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'a0e0a0e0-0000-0000-0000-000000000010', 'CS23B1001', 'Alice Johnson', '+15550101', 'd0e0a0e0-0000-0000-0000-000000000001', 3, 'A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'),
('c0e0a0e0-0000-0000-0000-000000000002', 'a0e0a0e0-0000-0000-0000-000000000011', 'CS23B1002', 'Bob Smith', '+15550102', 'd0e0a0e0-0000-0000-0000-000000000001', 3, 'A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'),
('c0e0a0e0-0000-0000-0000-000000000003', 'a0e0a0e0-0000-0000-0000-000000000012', 'EC23B2001', 'Charlie Brown', '+15550103', 'd0e0a0e0-0000-0000-0000-000000000002', 3, 'B', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie');

-- 6. Insert Subjects
INSERT INTO subjects (id, name, code, department_id, faculty_id) VALUES 
('cb00a0e0-0000-0000-0000-000000000001', 'Data Structures & Algorithms', 'CS301', 'd0e0a0e0-0000-0000-0000-000000000001', 'f0e0a0e0-0000-0000-0000-000000000003'),
('cb00a0e0-0000-0000-0000-000000000002', 'Database Management Systems', 'CS302', 'd0e0a0e0-0000-0000-0000-000000000001', 'f0e0a0e0-0000-0000-0000-000000000004'),
('cb00a0e0-0000-0000-0000-000000000003', 'Digital Signal Processing', 'EC301', 'd0e0a0e0-0000-0000-0000-000000000002', 'f0e0a0e0-0000-0000-0000-000000000005');

-- 7. Insert Attendance Records
-- Student 1 (Alice) DSA
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-01', 'present'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-02', 'present'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-03', 'absent'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-04', 'present'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-05', 'present');

-- Student 1 (Alice) DBMS
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000002', '2026-06-01', 'present'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000002', '2026-06-02', 'late'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000002', '2026-06-03', 'present'),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000002', '2026-06-04', 'present');

-- Student 2 (Bob) DSA
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES 
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-01', 'present'),
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-02', 'present'),
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-03', 'present'),
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', '2026-06-04', 'present');

-- Student 3 (Charlie) DSP
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES 
('c0e0a0e0-0000-0000-0000-000000000003', 'cb00a0e0-0000-0000-0000-000000000003', '2026-06-01', 'present'),
('c0e0a0e0-0000-0000-0000-000000000003', 'cb00a0e0-0000-0000-0000-000000000003', '2026-06-02', 'absent'),
('c0e0a0e0-0000-0000-0000-000000000003', 'cb00a0e0-0000-0000-0000-000000000003', '2026-06-03', 'present'),
('c0e0a0e0-0000-0000-0000-000000000003', 'cb00a0e0-0000-0000-0000-000000000003', '2026-06-04', 'present');

-- 8. Insert Marks Records
-- Alice DSA
INSERT INTO marks (student_id, subject_id, exam_type, marks, total_marks) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', 'Internal 1', 22.5, 25),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', 'Internal 2', 21.0, 25),
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000001', 'Semester', 88.0, 100);

-- Alice DBMS
INSERT INTO marks (student_id, subject_id, exam_type, marks, total_marks) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'cb00a0e0-0000-0000-0000-000000000002', 'Internal 1', 19.5, 25);

-- Bob DSA
INSERT INTO marks (student_id, subject_id, exam_type, marks, total_marks) VALUES 
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', 'Internal 1', 18.0, 25),
('c0e0a0e0-0000-0000-0000-000000000002', 'cb00a0e0-0000-0000-0000-000000000001', 'Internal 2', 20.0, 25);

-- Charlie DSP
INSERT INTO marks (student_id, subject_id, exam_type, marks, total_marks) VALUES 
('c0e0a0e0-0000-0000-0000-000000000003', 'cb00a0e0-0000-0000-0000-000000000003', 'Internal 1', 24.0, 25);

-- 9. Insert Leave Requests
INSERT INTO leave_requests (student_id, reason, from_date, to_date, status, approved_by) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'Family emergency and wedding to attend.', '2026-06-10', '2026-06-12', 'pending', NULL),
('c0e0a0e0-0000-0000-0000-000000000002', 'Recovering from fever and doctor advised rest.', '2026-05-20', '2026-05-22', 'approved', 'f0e0a0e0-0000-0000-0000-000000000001');

-- 10. Insert Announcements
INSERT INTO announcements (title, description, department_id, created_by) VALUES 
('Mid-Semester Examinations Schedule', 'The mid-semester examinations will commence from June 15th, 2026. Detailed timetables will be posted by the respective department HODs.', NULL, 'a0e0a0e0-0000-0000-0000-000000000001'),
('CSE Technical Seminar Series', 'All 3rd-year computer science students are required to attend the guest lecture on Quantum Computing on June 8th, 2026 at the Seminar Hall.', 'd0e0a0e0-0000-0000-0000-000000000001', 'a0e0a0e0-0000-0000-0000-000000000003');

-- 11. Study Materials
INSERT INTO study_materials (title, file_url, subject_id, uploaded_by) VALUES 
('Lecture 1 - Introduction to Trees & Graphs', 'https://supabase.co/storage/v1/object/public/materials/lecture1_dsa.pdf', 'cb00a0e0-0000-0000-0000-000000000001', 'f0e0a0e0-0000-0000-0000-000000000003'),
('Lecture 2 - Sorting and Hashing', 'https://supabase.co/storage/v1/object/public/materials/sorting_hashing.pdf', 'cb00a0e0-0000-0000-0000-000000000001', 'f0e0a0e0-0000-0000-0000-000000000003'),
('Relational Algebra & Normalization notes', 'https://supabase.co/storage/v1/object/public/materials/normalization.pdf', 'cb00a0e0-0000-0000-0000-000000000002', 'f0e0a0e0-0000-0000-0000-000000000004');

-- 12. Events
INSERT INTO events (id, title, description, event_type, event_date, location, organizer, registration_deadline) VALUES 
('e0e0a0e0-0000-0000-0000-000000000001', 'Hackathon 2026', 'A 36-hour coding challenge to build innovative solutions for global sustainability problems.', 'hackathon', '2026-06-20 09:00:00+00', 'Campus Innovation Center', 'Google Developer Student Clubs', '2026-06-15 18:00:00+00'),
('e0e0a0e0-0000-0000-0000-000000000002', 'Advanced Deep Learning Workshop', 'A hands-on workshop covering PyTorch, Transformer networks, and LLM fine-tuning techniques.', 'workshop', '2026-06-25 10:00:00+00', 'Main Computer Labs', 'AI Research Lab', '2026-06-22 23:59:00+00');

-- 13. Event Registrations
INSERT INTO event_registrations (event_id, student_id) VALUES 
('e0e0a0e0-0000-0000-0000-000000000001', 'c0e0a0e0-0000-0000-0000-000000000001'),
('e0e0a0e0-0000-0000-0000-000000000001', 'c0e0a0e0-0000-0000-0000-000000000002');

-- 14. Placements
INSERT INTO placements (id, company_name, role, package, eligibility, deadline) VALUES 
('ba00a0e0-0000-0000-0000-000000000001', 'Stripe', 'Software Engineer (Frontend/Fullstack)', '$120,000 / Year', 'Minimum CGPA 8.0, CSE and ECE branches only', '2026-06-18 12:00:00+00'),
('ba00a0e0-0000-0000-0000-000000000002', 'Tesla', 'Embedded Systems Intern', '$45 / Hour', 'ECE and EEE students. Basic C/C++ knowledge required', '2026-06-25 18:00:00+00');

-- 15. Placement Applications
INSERT INTO placement_applications (placement_id, student_id, resume_url, status) VALUES 
('ba00a0e0-0000-0000-0000-000000000001', 'c0e0a0e0-0000-0000-0000-000000000001', 'https://supabase.co/storage/v1/object/public/resumes/alice_resume.pdf', 'shortlisted');

-- 16. Digital ID Cards
INSERT INTO digital_id_cards (student_id, qr_code, verification_token) VALUES 
('c0e0a0e0-0000-0000-0000-000000000001', 'https://college.edu/verify/token_alice_123', 'token_alice_123'),
('c0e0a0e0-0000-0000-0000-000000000002', 'https://college.edu/verify/token_bob_456', 'token_bob_456'),
('c0e0a0e0-0000-0000-0000-000000000003', 'https://college.edu/verify/token_charlie_789', 'token_charlie_789');

-- 17. Activity Logs
INSERT INTO activity_logs (user_id, action, details) VALUES 
('a0e0a0e0-0000-0000-0000-000000000001', 'DB_SEED', 'Successfully seeded initial system database structure and test records.');
