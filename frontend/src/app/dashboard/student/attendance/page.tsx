'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserCheck, Clock, ShieldAlert, Award } from 'lucide-react';
import { useToast } from '@/app/providers';

export default function StudentAttendancePage() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/student/attendance');
        setAttendance(res.data.data);
      } catch (err) {
        toast('Failed to load attendance logs. Showing fallback data.', 'warning');
        setAttendance([
          { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', percentage: 90, total_classes: 20, attended_classes: 18 },
          { subject_code: 'CS302', subject_name: 'Database Management Systems', percentage: 75, total_classes: 20, attended_classes: 15 },
          { subject_code: 'EC301', subject_name: 'Digital Signal Processing', percentage: 80, total_classes: 15, attended_classes: 12 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Attendance Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review subject attendance percentages and total classes logged.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {attendance.map((sub, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-48 card-hover">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-bold uppercase tracking-wider">{sub.subject_code}</span>
                <span className={`text-2xl font-black ${sub.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {sub.percentage}%
                </span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-3 line-clamp-1">{sub.subject_name}</h3>
            </div>

            <div className="mt-4 space-y-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Attended: {sub.attended_classes} classes</span>
                <span>Total: {sub.total_classes} class runs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
