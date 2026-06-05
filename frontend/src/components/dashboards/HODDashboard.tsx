'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Users, BookOpen, Clock, Calendar, BarChart as ChartIcon, 
  ChevronRight, ArrowRight, UserCheck, ShieldAlert 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { useToast } from '@/app/providers';
import Link from 'next/link';

export default function HODDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/hod/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load HOD dashboard', err);
        toast('Failed to load dashboard data. Showing demo fallback.', 'warning');
        
        // Demo Fallback Data
        setData({
          profile: {
            name: 'Dr. Alan Turing',
            designation: 'HOD & Professor',
            department_name: 'Computer Science & Engineering',
            department_code: 'CSE'
          },
          stats: {
            studentCount: 1250,
            facultyCount: 18,
            subjectCount: 24
          },
          facultyList: [
            { id: 'f1', name: 'Prof. Grace Hopper', employee_id: 'EMP_CSE_02', designation: 'Assistant Professor', subjects_count: 2 },
            { id: 'f2', name: 'Dr. Donald Knuth', employee_id: 'EMP_CSE_03', designation: 'Associate Professor', subjects_count: 2 }
          ],
          attendanceReport: [
            { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', total_attendance_records: 120, total_present: 108 },
            { subject_code: 'CS302', subject_name: 'Database Management Systems', total_attendance_records: 120, total_present: 90 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Map attendance rates
  const attendanceChartData = data.attendanceReport?.map((r: any) => {
    const records = parseInt(r.total_attendance_records) || 0;
    const present = parseInt(r.total_present) || 0;
    const rate = records > 0 ? Math.round((present / records) * 100) : 100;
    return {
      name: r.subject_code,
      rate
    };
  }) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Department Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Dr. Turing • Head of {data.profile?.department_name} ({data.profile?.department_code})
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/hod/timetable"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm cursor-pointer shadow-md shadow-brand-500/20 transition-all card-hover"
          >
            <Calendar className="w-4 h-4" /> Manage Timetable Schedule
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Enrolled Students', val: data.stats?.studentCount, sub: 'Total active profiles', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', icon: Users },
          { label: 'Department Faculty', val: data.stats?.facultyCount, sub: 'Teaching & Research staff', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', icon: UserCheck },
          { label: 'Offered Courses / Subjects', val: data.stats?.subjectCount, sub: 'Academic curriculum', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400', icon: BookOpen },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 bg-gradient-to-br ${card.color} border rounded-2xl flex items-center justify-between card-hover`}
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {card.label}
                </span>
                <span className="text-3xl font-extrabold block text-slate-900 dark:text-white leading-tight">
                  {card.val}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
                  {card.sub}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance metrics */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Subject Attendance Rates</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Visual tracking of student attendance averages across curriculum subjects.</p>
          <div className="h-64 w-full">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15,23,42,0.95)', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="rate" fill="hsl(224, 86%, 53%)" radius={[6, 6, 0, 0]} name="Average Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-8">
                No attendance records logged in department.
              </div>
            )}
          </div>
        </div>

        {/* Faculty summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Department Faculty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Teaching roles and syllabus scopes</p>
            
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
              {data.facultyList?.map((fac: any) => (
                <div key={fac.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-slate-850 dark:text-white leading-tight">{fac.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{fac.designation}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-brand-500">{fac.subjects_count}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Subjects</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/dashboard/hod/students"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold text-xs transition-all mt-4"
          >
            Review Enrolled Students <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
