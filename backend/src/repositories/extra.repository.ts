import { supabase, firebaseAdmin } from '../config/db';

// 11. Placement Repository
export const PlacementRepository = {
  findAll: async () => {
    const { data, error } = await supabase
      .from('placements')
      .select('*')
      .order('deadline', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  findById: async (id: string) => {
    const { data, error } = await supabase
      .from('placements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  create: async (
    companyName: string,
    role: string,
    packageName: string,
    eligibility: string,
    deadline: string,
    postedBy: string
  ) => {
    const { data, error } = await supabase
      .from('placements')
      .insert({
        company_name: companyName,
        role,
        package: packageName,
        eligibility,
        deadline,
        posted_by: postedBy
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  apply: async (placementId: string, studentId: string, resumeUrl: string) => {
    const { data, error } = await supabase
      .from('placement_applications')
      .insert({
        placement_id: placementId,
        student_id: studentId,
        resume_url: resumeUrl
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  getApplications: async (placementId?: string) => {
    let query = supabase.from('placement_applications').select('*');
    if (placementId) {
      query = query.eq('placement_id', placementId);
    }

    const { data: apps, error } = await query.order('applied_at', { ascending: false });
    if (error) throw error;

    const { data: students } = await supabase.from('students').select('id, name, roll_number, department_id');
    const { data: depts } = await supabase.from('departments').select('id, code');
    const { data: placements } = await supabase.from('placements').select('id, company_name, role');

    return apps?.map(app => {
      const st = students?.find(s => s.id === app.student_id);
      const dept = depts?.find(d => d.id === st?.department_id);
      const pl = placements?.find(p => p.id === app.placement_id);
      return {
        ...app,
        student_name: st?.name || '',
        roll_number: st?.roll_number || '',
        department_code: dept ? dept.code : '',
        company_name: pl?.company_name || '',
        role: pl?.role || ''
      };
    }) || [];
  },

  getStudentApplications: async (studentId: string) => {
    const { data: apps, error } = await supabase
      .from('placement_applications')
      .select('*')
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    const { data: placements } = await supabase.from('placements').select('id, company_name, role, package');

    return apps?.map(app => {
      const pl = placements?.find(p => p.id === app.placement_id);
      return {
        ...app,
        company_name: pl ? pl.company_name : '',
        role: pl ? pl.role : '',
        package: pl ? pl.package : ''
      };
    }) || [];
  },

  updateStatus: async (applicationId: string, status: 'applied' | 'shortlisted' | 'selected' | 'rejected') => {
    const { data, error } = await supabase
      .from('placement_applications')
      .update({ status })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
};

// 12. Event Repository
export const EventRepository = {
  findAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  findById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  create: async (
    title: string,
    description: string,
    eventType: string,
    eventDate: string,
    location: string,
    organizer: string,
    registrationDeadline: string
  ) => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_type: eventType,
        event_date: eventDate,
        location,
        organizer,
        registration_deadline: registrationDeadline
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  register: async (eventId: string, studentId: string) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({ event_id: eventId, student_id: studentId })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  getRegistrations: async (eventId: string) => {
    const { data: regs, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    const { data: students } = await supabase.from('students').select('id, name, roll_number, department_id');
    const { data: depts } = await supabase.from('departments').select('id, code');

    return regs?.map(reg => {
      const st = students?.find(s => s.id === reg.student_id);
      const dept = depts?.find(d => d.id === st?.department_id);
      return {
        ...reg,
        student_name: st ? st.name : '',
        roll_number: st ? st.roll_number : '',
        department_code: dept ? dept.code : ''
      };
    }) || [];
  },

  getStudentRegistrations: async (studentId: string) => {
    const { data: regs, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    const { data: events } = await supabase.from('events').select('id, title, event_date, location, event_type');

    return regs?.map(reg => {
      const evt = events?.find(e => e.id === reg.event_id);
      return {
        ...reg,
        title: evt ? evt.title : '',
        event_date: evt ? evt.event_date : '',
        location: evt ? evt.location : '',
        event_type: evt ? evt.event_type : ''
      };
    }) || [];
  },

  issueCertificate: async (studentId: string, eventId: string, certificateUrl: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .upsert({
        student_id: studentId,
        event_id: eventId,
        certificate_url: certificateUrl
      }, { onConflict: 'student_id,event_id' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  getCertificates: async (studentId: string) => {
    const { data: certs, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });

    if (error) throw error;

    const { data: events } = await supabase.from('events').select('id, title, event_date');

    return certs?.map(c => {
      const evt = events?.find(e => e.id === c.event_id);
      return {
        ...c,
        event_title: evt ? evt.title : '',
        event_date: evt ? evt.event_date : ''
      };
    }) || [];
  }
};

// 13. Digital ID Cards Repository
export const DigitalIDCardRepository = {
  findByStudentId: async (studentId: string) => {
    const { data, error } = await supabase
      .from('digital_id_cards')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  findByVerificationToken: async (token: string) => {
    const { data: card, error } = await supabase
      .from('digital_id_cards')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (error) throw error;
    if (!card) return null;

    const { data: student } = await supabase.from('students').select('*').eq('id', card.student_id).maybeSingle();
    if (!student) return null;

    const { data: dept } = await supabase.from('departments').select('name, code').eq('id', student.department_id).maybeSingle();

    return {
      ...card,
      student_name: student.name,
      roll_number: student.roll_number,
      year: student.year,
      section: student.section,
      phone: student.phone,
      profile_image: student.profile_image,
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    };
  },

  createOrUpdate: async (studentId: string, qrCode: string, token: string) => {
    const { data, error } = await supabase
      .from('digital_id_cards')
      .upsert({
        student_id: studentId,
        qr_code: qrCode,
        verification_token: token
      }, { onConflict: 'student_id' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
};

// 14. Activity Log (Audit Trail)
export const ActivityLogRepository = {
  log: async (userId: string | null, action: string, details?: string) => {
    const logRecord = {
      user_id: userId,
      action,
      details: details || null,
      created_at: new Date().toISOString(),
    };

    // Attempt Firebase Firestore audit log
    if (firebaseAdmin.apps.length > 0) {
      try {
        const db = firebaseAdmin.firestore();
        await db.collection('activity_logs').add(logRecord);
        console.log(`[FIREBASE AUDIT LOG]: successfully saved action: ${action}`);
        return;
      } catch (error) {
        console.error('[FIREBASE AUDIT LOG ERROR]: falling back to Supabase...', error);
      }
    }

    // Fallback: write to Supabase
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action,
        details: details || null
      });
      console.log(`[SUPABASE AUDIT LOG]: successfully saved action: ${action}`);
    } catch (error) {
      console.error('Failed to log audit activity on both Firebase and Supabase:', error);
    }
  },

  findAll: async () => {
    // Attempt to read logs from Firebase Firestore
    if (firebaseAdmin.apps.length > 0) {
      try {
        const db = firebaseAdmin.firestore();
        const snapshot = await db.collection('activity_logs').orderBy('created_at', 'desc').limit(100).get();
        
        const logsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];

        const { data: users } = await supabase.from('users').select('id, email, role');
        
        return logsList.map(log => {
          const usr = users?.find(u => u.id === log.user_id);
          return {
            ...log,
            user_email: usr ? usr.email : 'system',
            user_role: usr ? usr.role : 'system'
          };
        });
      } catch (error) {
        console.error('[FIREBASE AUDIT LOG READ ERROR]: falling back to Supabase...', error);
      }
    }

    // Fallback: read from Supabase
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const { data: users } = await supabase.from('users').select('id, email, role');

    return logs?.map(log => {
      const usr = users?.find(u => u.id === log.user_id);
      return {
        ...log,
        user_email: usr ? usr.email : 'system',
        user_role: usr ? usr.role : 'system'
      };
    }) || [];
  }
};
