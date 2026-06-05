import { supabase } from '../config/db';

// 5. Subject Repository
export const SubjectRepository = {
  findAll: async () => {
    const { data: subjects, error } = await supabase.from('subjects').select('*');
    if (error) throw error;

    const { data: depts } = await supabase.from('departments').select('id, name, code');
    const { data: facs } = await supabase.from('faculty').select('id, name');

    return subjects?.map(s => {
      const dept = depts?.find(d => d.id === s.department_id);
      const fac = facs?.find(f => f.id === s.faculty_id);
      return {
        ...s,
        department_name: dept ? dept.name : '',
        department_code: dept ? dept.code : '',
        faculty_name: fac ? fac.name : ''
      };
    }) || [];
  },

  findById: async (id: string) => {
    const { data, error } = await supabase.from('subjects').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data || null;
  },

  findByDepartmentId: async (departmentId: string) => {
    const { data: subjects, error } = await supabase.from('subjects').select('*').eq('department_id', departmentId);
    if (error) throw error;

    const { data: facs } = await supabase.from('faculty').select('id, name');

    return subjects?.map(s => {
      const fac = facs?.find(f => f.id === s.faculty_id);
      return {
        ...s,
        faculty_name: fac ? fac.name : ''
      };
    }) || [];
  },

  findByFacultyId: async (facultyId: string) => {
    const { data: subjects, error } = await supabase.from('subjects').select('*').eq('faculty_id', facultyId);
    if (error) throw error;

    const { data: depts } = await supabase.from('departments').select('id, name');

    return subjects?.map(s => {
      const dept = depts?.find(d => d.id === s.department_id);
      return {
        ...s,
        department_name: dept ? dept.name : ''
      };
    }) || [];
  },

  create: async (name: string, code: string, departmentId: string, facultyId: string) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name, code, department_id: departmentId, faculty_id: facultyId })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
  }
};

// 6. Attendance Repository
export const AttendanceRepository = {
  markAttendance: async (
    subjectId: string,
    attendanceDate: string,
    records: { student_id: string; status: 'present' | 'absent' | 'late' }[]
  ) => {
    const upsertData = records.map(rec => ({
      student_id: rec.student_id,
      subject_id: subjectId,
      attendance_date: attendanceDate,
      status: rec.status,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(upsertData, { onConflict: 'student_id,subject_id,attendance_date' });

    if (error) throw error;
  },

  getStudentAttendanceSummary: async (studentId: string) => {
    // 1. Fetch student info to get department_id
    const { data: student, error: studentError } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
    if (studentError || !student) return [];

    // 2. Fetch subjects in department
    const { data: subjects, error: subjectsError } = await supabase.from('subjects').select('*').eq('department_id', student.department_id);
    if (subjectsError || !subjects) return [];

    // 3. Fetch attendance records for this student
    const { data: attendanceLogs, error: attendanceError } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    if (attendanceError || !attendanceLogs) return [];

    // 4. Summarize count values
    return subjects.map(s => {
      const subjectLogs = attendanceLogs.filter(a => a.subject_id === s.id);
      const total = subjectLogs.length;
      const attended = subjectLogs.filter(a => a.status === 'present' || a.status === 'late').length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
      return {
        subject_id: s.id,
        subject_name: s.name,
        subject_code: s.code,
        total_classes: total,
        attended_classes: attended,
        percentage
      };
    });
  },

  getSubjectAttendanceLogs: async (studentId: string, subjectId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, attendance_date, status')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getFacultySubjectLogs: async (subjectId: string, date: string) => {
    // 1. Find subject department
    const { data: subject } = await supabase.from('subjects').select('department_id').eq('id', subjectId).maybeSingle();
    if (!subject) return [];

    // 2. Find students in this department
    const { data: students } = await supabase.from('students').select('id, name, roll_number').eq('department_id', subject.department_id);
    if (!students) return [];

    // 3. Find attendance logs
    const { data: logs } = await supabase.from('attendance').select('*').eq('subject_id', subjectId).eq('attendance_date', date);

    return students.map(st => {
      const attRecord = logs?.find(l => l.student_id === st.id);
      return {
        student_id: st.id,
        name: st.name,
        roll_number: st.roll_number,
        status: attRecord ? attRecord.status : 'absent'
      };
    });
  }
};

// 7. Marks Repository
export const MarksRepository = {
  uploadMarks: async (
    subjectId: string,
    examType: string,
    records: { student_id: string; marks: number; total_marks: number }[]
  ) => {
    const upsertData = records.map(rec => ({
      student_id: rec.student_id,
      subject_id: subjectId,
      exam_type: examType,
      marks: rec.marks,
      total_marks: rec.total_marks,
    }));

    const { error } = await supabase
      .from('marks')
      .upsert(upsertData, { onConflict: 'student_id,subject_id,exam_type' });

    if (error) throw error;
  },

  getStudentMarks: async (studentId: string) => {
    const { data: marks, error } = await supabase.from('marks').select('*').eq('student_id', studentId);
    if (error) throw error;

    const { data: subjects } = await supabase.from('subjects').select('id, name, code');

    return marks?.map(m => {
      const sub = subjects?.find(s => s.id === m.subject_id);
      return {
        ...m,
        subject_name: sub ? sub.name : '',
        subject_code: sub ? sub.code : ''
      };
    }) || [];
  },

  getSubjectMarksReport: async (subjectId: string, examType: string) => {
    const { data: subject } = await supabase.from('subjects').select('department_id').eq('id', subjectId).maybeSingle();
    if (!subject) return [];

    const { data: students } = await supabase.from('students').select('id, name, roll_number').eq('department_id', subject.department_id);
    if (!students) return [];

    const { data: marks } = await supabase.from('marks').select('*').eq('subject_id', subjectId).eq('exam_type', examType);

    return students.map(st => {
      const markRec = marks?.find(m => m.student_id === st.id);
      return {
        student_id: st.id,
        name: st.name,
        roll_number: st.roll_number,
        marks: markRec ? markRec.marks : null,
        total_marks: markRec ? markRec.total_marks : null
      };
    });
  }
};

// 8. Leave Requests Repository
export const LeaveRequestRepository = {
  create: async (studentId: string, reason: string, fromDate: string, toDate: string) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ student_id: studentId, reason, from_date: fromDate, to_date: toDate })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  findByStudentId: async (studentId: string) => {
    const { data: leaves, error } = await supabase.from('leave_requests').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    if (error) throw error;

    const { data: facs } = await supabase.from('faculty').select('id, name');

    return leaves?.map(l => {
      const fac = facs?.find(f => f.id === l.approved_by);
      return {
        ...l,
        approved_by_name: fac ? fac.name : null
      };
    }) || [];
  },

  findByDepartmentId: async (departmentId: string) => {
    const { data: students } = await supabase.from('students').select('id, name, roll_number, year, section').eq('department_id', departmentId);
    if (!students) return [];

    const studentIds = students.map(s => s.id);
    if (studentIds.length === 0) return [];

    const { data: leaves, error } = await supabase
      .from('leave_requests')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return leaves?.map(l => {
      const st = students.find(s => s.id === l.student_id);
      return {
        ...l,
        student_name: st?.name,
        roll_number: st?.roll_number,
        year: st?.year,
        section: st?.section
      };
    }) || [];
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected', approvedByFacultyId: string) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status, approved_by: approvedByFacultyId })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
};

// 9. Announcements Repository
export const AnnouncementRepository = {
  create: async (title: string, description: string, departmentId: string | null, createdBy: string) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert({ title, description, department_id: departmentId, created_by: createdBy })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  findAll: async (departmentId?: string) => {
    let query = supabase.from('announcements').select('*');
    
    if (departmentId) {
      query = query.or(`department_id.is.null,department_id.eq.${departmentId}`);
    }

    const { data: announcements, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const { data: users } = await supabase.from('users').select('id, email');
    const { data: depts } = await supabase.from('departments').select('id, code');

    return announcements?.map(a => {
      const usr = users?.find(u => u.id === a.created_by);
      const dept = depts?.find(d => d.id === a.department_id);
      return {
        ...a,
        creator_email: usr ? usr.email : '',
        department_code: dept ? dept.code : null
      };
    }) || [];
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
};

// 10. Study Materials Repository
export const StudyMaterialsRepository = {
  create: async (title: string, fileUrl: string, subjectId: string, uploadedBy: string) => {
    const { data, error } = await supabase
      .from('study_materials')
      .insert({ title, file_url: fileUrl, subject_id: subjectId, uploaded_by: uploadedBy })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  findBySubjectId: async (subjectId: string) => {
    const { data: materials, error } = await supabase.from('study_materials').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
    if (error) throw error;

    const { data: facs } = await supabase.from('faculty').select('id, name');

    return materials?.map(m => {
      const fac = facs?.find(f => f.id === m.uploaded_by);
      return {
        ...m,
        faculty_name: fac ? fac.name : ''
      };
    }) || [];
  },

  findByStudentId: async (studentId: string) => {
    const { data: student } = await supabase.from('students').select('department_id').eq('id', studentId).maybeSingle();
    if (!student) return [];

    const { data: subjects } = await supabase.from('subjects').select('id, name, code').eq('department_id', student.department_id);
    if (!subjects) return [];

    const subIds = subjects.map(s => s.id);
    if (subIds.length === 0) return [];

    const { data: materials, error } = await supabase.from('study_materials').select('*').in('subject_id', subIds).order('created_at', { ascending: false });
    if (error) throw error;

    const { data: facs } = await supabase.from('faculty').select('id, name');

    return materials?.map(m => {
      const sub = subjects.find(s => s.id === m.subject_id);
      const fac = facs?.find(f => f.id === m.uploaded_by);
      return {
        ...m,
        subject_name: sub ? sub.name : '',
        subject_code: sub ? sub.code : '',
        faculty_name: fac ? fac.name : ''
      };
    }) || [];
  }
};
