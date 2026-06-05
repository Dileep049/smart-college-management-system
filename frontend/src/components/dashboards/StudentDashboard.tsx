'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  UserCheck, Award, Briefcase, Calendar, Bell, 
  ChevronRight, BookOpen, Clock, Download 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { useToast } from '@/app/providers';
import Link from 'next/link';

export default function StudentDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
        toast('Failed to load dashboard data. Showing demo fallback.', 'warning');
        
        // Demo Fallback Data
        setData({
          profile: {
            name: 'Alice Johnson',
            roll_number: 'CS23B1001',
            department_name: 'Computer Science & Engineering',
            year: 3,
            section: 'A'
          },
          stats: {
            overallAttendance: 85,
            marksCount: 4,
            eventsRegisteredCount: 2,
            placementsCount: 2
          },
          announcements: [
            { id: '1', title: 'Mid-Semester Exams Schedule', description: 'Exams starting June 15th, check HOD board.', created_at: new Date().toISOString() },
            { id: '2', title: 'Quantum Computing Lecture', description: 'Guest lecture in Seminar Hall.', created_at: new Date().toISOString() }
          ],
          attendance: [
            { subject_code: 'CS301', subject_name: 'Data Structures & Algorithms', percentage: 90, total_classes: 20, attended_classes: 18 },
            { subject_code: 'CS302', subject_name: 'Database Management Systems', percentage: 75, total_classes: 20, attended_classes: 15 },
            { subject_code: 'EC301', subject_name: 'Digital Signal Processing', percentage: 80, total_classes: 15, attended_classes: 12 }
          ],
          marks: [
            { subject_code: 'CS301', exam_type: 'Internal 1', marks: 22.5, total_marks: 25 },
            { subject_code: 'CS302', exam_type: 'Internal 1', marks: 19.5, total_marks: 25 },
            { subject_code: 'EC301', exam_type: 'Internal 1', marks: 24.0, total_marks: 25 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  const handleDownloadTranscript = async () => {
    try {
      toast('Generating transcript PDF...', 'info');
      const response = await api.get('/student/transcript', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `transcript_${data?.profile?.roll_number || 'student'}.pdf`;
      link.click();
      toast('Transcript downloaded successfully!', 'success');
    } catch (err) {
      toast('Failed to download transcript. Trying local fallback...', 'error');
      window.open('http://localhost:5000/api/student/transcript');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {data.profile?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Department of {data.profile?.department_name} • Year {data.profile?.year} (Sec {data.profile?.section})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTranscript}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm cursor-pointer shadow-md shadow-brand-500/20 transition-all card-hover"
          >
            <Download className="w-4 h-4" /> Download Academic Transcript
          </button>
          <Link
            href="/dashboard/student/id-card"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-700 dark:text-slate-350 font-semibold text-sm transition-all"
          >
            View ID Card
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Overall Attendance', val: `${data.stats?.overallAttendance}%`, sub: 'Target: > 75%', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', icon: UserCheck },
          { label: 'Total Subjects Graded', val: data.stats?.marksCount, sub: 'Internal evaluations', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', icon: Award },
          { label: 'Registered Events', val: data.stats?.eventsRegisteredCount, sub: 'Technical & Cultural', color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400', icon: Calendar },
          { label: 'Open Placements', val: data.stats?.placementsCount, sub: 'Job & Internship posts', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400', icon: Briefcase },
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Subject-wise Attendance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Classes attended vs classes registered</p>
            </div>
            <Link href="/dashboard/student/attendance" className="text-xs font-semibold text-brand-500 flex items-center gap-1">
              View details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.attendance}>
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(224, 86%, 53%)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(224, 86%, 53%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="subject_code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15,23,42,0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="percentage" stroke="hsl(224, 86%, 53%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPercentage)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Announcements List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Announcements</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Campus notifications</p>
            </div>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[260px] pr-2">
            {data.announcements?.length > 0 ? (
              data.announcements.map((ann: any) => (
                <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-brand-500 dark:text-brand-400 font-bold uppercase block mb-1">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{ann.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.description}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-8">
                No recent announcements.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Marks Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Evaluation Grades</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Marks secured in internal examinations</p>
          </div>
          <Link href="/dashboard/student/marks" className="text-xs font-semibold text-brand-500 flex items-center gap-1">
            View report card <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.marks}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="subject_code" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15,23,42,0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="marks" fill="hsl(263, 90%, 50%)" radius={[6, 6, 0, 0]} name="Marks Secured" />
              <Bar dataKey="total_marks" fill="rgba(148, 163, 184, 0.15)" radius={[6, 6, 0, 0]} name="Max Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
