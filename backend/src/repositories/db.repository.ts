import { supabase } from '../config/db';

// 1. User Repository
export const UserRepository = {
  findByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (error) throw error;
    return data || null;
  },

  findById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  create: async (email: string, passwordHash: string, role: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, role })
      .select('id, email, role, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  updatePassword: async (id: string, passwordHash: string) => {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// 2. Department Repository
export const DepartmentRepository = {
  findAll: async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*, faculty!departments_hod_id_fkey(name)'); // Join using custom relationship resolver or standard mappings
      
    if (error) {
      // Fallback in case of relationship name resolution issues: get departments, then faculty
      const { data: depts } = await supabase.from('departments').select('*');
      const { data: facs } = await supabase.from('faculty').select('id, name');
      return depts?.map(d => {
        const fac = facs?.find(f => f.id === d.hod_id);
        return { ...d, hod_name: fac ? fac.name : null };
      }) || [];
    }

    return data?.map(d => ({
      ...d,
      hod_name: (d.faculty as any)?.name || null
    })) || [];
  },

  findById: async (id: string) => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  findByCode: async (code: string) => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  create: async (name: string, code: string) => {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, code })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  updateHOD: async (id: string, hodId: string | null) => {
    const { data, error } = await supabase
      .from('departments')
      .update({ hod_id: hodId })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  getStats: async (id?: string) => {
    if (id) {
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('department_id', id);
      const { count: facultyCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true }).eq('department_id', id);
      const { count: subjectCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('department_id', id);
      return {
        studentCount: studentCount || 0,
        facultyCount: facultyCount || 0,
        subjectCount: subjectCount || 0,
      };
    } else {
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: facultyCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
      const { count: departmentCount } = await supabase.from('departments').select('*', { count: 'exact', head: true });
      const { count: subjectCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
      const { count: placementCount } = await supabase.from('placements').select('*', { count: 'exact', head: true });
      const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      return {
        studentCount: studentCount || 0,
        facultyCount: facultyCount || 0,
        departmentCount: departmentCount || 0,
        subjectCount: subjectCount || 0,
        placementCount: placementCount || 0,
        eventCount: eventCount || 0,
      };
    }
  }
};

// 3. Faculty Repository
export const FacultyRepository = {
  findAll: async () => {
    const { data: facultyList, error } = await supabase.from('faculty').select('*');
    if (error) throw error;

    const { data: users } = await supabase.from('users').select('id, email');
    const { data: depts } = await supabase.from('departments').select('id, name, code');

    return facultyList?.map(f => {
      const usr = users?.find(u => u.id === f.user_id);
      const dept = depts?.find(d => d.id === f.department_id);
      return {
        ...f,
        email: usr ? usr.email : '',
        department_name: dept ? dept.name : '',
        department_code: dept ? dept.code : ''
      };
    }) || [];
  },

  findById: async (id: string) => {
    const { data: faculty, error } = await supabase.from('faculty').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!faculty) return null;

    const { data: usr } = await supabase.from('users').select('email').eq('id', faculty.user_id).maybeSingle();
    const { data: dept } = await supabase.from('departments').select('name, code').eq('id', faculty.department_id).maybeSingle();

    return {
      ...faculty,
      email: usr ? usr.email : '',
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    };
  },

  findByUserId: async (userId: string) => {
    const { data: faculty, error } = await supabase.from('faculty').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!faculty) return null;

    const { data: usr } = await supabase.from('users').select('email').eq('id', faculty.user_id).maybeSingle();
    const { data: dept } = await supabase.from('departments').select('name, code').eq('id', faculty.department_id).maybeSingle();

    return {
      ...faculty,
      email: usr ? usr.email : '',
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    };
  },

  create: async (userId: string, employeeId: string, name: string, departmentId: string, designation: string) => {
    const { data, error } = await supabase
      .from('faculty')
      .insert({ user_id: userId, employee_id: employeeId, name, department_id: departmentId, designation })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// 4. Student Repository
export const StudentRepository = {
  findAll: async (filters?: { departmentId?: string; year?: number; search?: string }) => {
    let query = supabase.from('students').select('*');
    
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data: studentList, error } = await query;
    if (error) throw error;

    const { data: users } = await supabase.from('users').select('id, email');
    const { data: depts } = await supabase.from('departments').select('id, name, code');

    return studentList?.map(s => {
      const usr = users?.find(u => u.id === s.user_id);
      const dept = depts?.find(d => d.id === s.department_id);
      return {
        ...s,
        email: usr ? usr.email : '',
        department_name: dept ? dept.name : '',
        department_code: dept ? dept.code : ''
      };
    }) || [];
  },

  findById: async (id: string) => {
    const { data: student, error } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!student) return null;

    const { data: usr } = await supabase.from('users').select('email').eq('id', student.user_id).maybeSingle();
    const { data: dept } = await supabase.from('departments').select('name, code').eq('id', student.department_id).maybeSingle();

    return {
      ...student,
      email: usr ? usr.email : '',
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    };
  },

  findByUserId: async (userId: string) => {
    const { data: student, error } = await supabase.from('students').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!student) return null;

    const { data: usr } = await supabase.from('users').select('email').eq('id', student.user_id).maybeSingle();
    const { data: dept } = await supabase.from('departments').select('name, code').eq('id', student.department_id).maybeSingle();

    return {
      ...student,
      email: usr ? usr.email : '',
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    };
  },

  create: async (
    userId: string,
    rollNumber: string,
    name: string,
    phone: string,
    departmentId: string,
    year: number,
    section: string,
    profileImage?: string | null
  ) => {
    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        roll_number: rollNumber,
        name,
        phone,
        department_id: departmentId,
        year,
        section,
        profile_image: profileImage || null
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
