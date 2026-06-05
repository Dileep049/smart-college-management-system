'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Users, BookOpen, Clock, FileText, Bell, 
  ChevronRight, ArrowUpRight, Check, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { useToast } from '@/app/providers';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/faculty/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load faculty dashboard', err);
        toast('Failed to load dashboard data. Showing demo fallback.', 'warning');
        
        // Demo Fallback Data
        setData({
          profile: {
            name: 'Prof. Grace Hopper',
            designation: 'Assistant Professor',
            department_name: 'Computer Science & Engineering',
            department_code: 'CSE'
          },
          stats: {
            subjectsCount: 2,
            studentsCount: 45,
            pendingLeavesCount: 1
          },
          subjects: [
            { id: 'sub0e0a0-0000-0000-0000-000000000001', name: 'Data Structures & Algorithms', code: 'CS301' },
            { id: 'sub0e0a0-0000-0000-0000-000000000002', name: 'Database Management Systems', code: 'CS302' }
          ],
          pendingLeaves: [
            { id: '1', student_name: 'Alice Johnson', roll_number: 'CS23B1001', reason: 'Family wedding attendance.', from_date: '2026-06-10', to_date: '2026-06-12', status: 'pending' }
          ],
          announcements: [
            { id: '1', title: 'CSE Technical Seminar Series', description: 'Quantum computing guest lecture on June 8th.', created_at: new Date().toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  const handleApproveLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await api.post(`/faculty/leaves/${leaveId}/approve`, { status });
      toast(`Leave request has been ${status}`, 'success');
      
      // Update local state
      setData((prev: any) => ({
        ...prev,
        pendingLeaves: prev.pendingLeaves.filter((l: any) => l.id !== leaveId),
        stats: {
          ...prev.stats,
          pendingLeavesCount: Math.max(0, prev.stats.pendingLeavesCount - 1)
        }
      }));
    } catch (err) {
      toast('Failed to update leave request status.', 'error');
    }
  };

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

  // Attendance average simulation data for subjects taught
  const chartData = data.subjects?.map((s: any, i: number) => ({
    name: s.code,
    attendance: i === 0 ? 88 : 82,
    passingRate: i === 0 ? 94 : 89
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Faculty Panel, {data.profile?.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {data.profile?.designation} • Department of {data.profile?.department_name} ({data.profile?.department_code})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Assigned Subjects', val: data.stats?.subjectsCount, sub: 'Academic curriculum', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', icon: BookOpen },
          { label: 'Department Students', val: data.stats?.studentsCount, sub: 'Enrolled profiles', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', icon: Users },
          { label: 'Pending Leave Approvals', val: data.stats?.pendingLeavesCount, sub: 'Awaiting reviews', color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400', icon: Clock },
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects list & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">My Subjects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.subjects?.map((sub: any) => (
                <div key={sub.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between h-40">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-bold">{sub.code}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mt-2 line-clamp-1">{sub.name}</h4>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/dashboard/faculty/attendance?subjectId=${sub.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Attendance
                    </Link>
                    <Link
                      href={`/dashboard/faculty/marks?subjectId=${sub.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200/30"
                    >
                      Grading
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Class Performance Insights</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Legend fontSize={11} />
                  <Bar dataKey="attendance" fill="hsl(224, 86%, 53%)" radius={[4, 4, 0, 0]} name="Avg Attendance %" />
                  <Bar dataKey="passingRate" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Avg Passing %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaves approvals and Announcements panel */}
        <div className="space-y-6">
          {/* Leaves approvals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-3">Leave Requests</h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {data.pendingLeaves?.length > 0 ? (
                data.pendingLeaves.map((leave: any) => (
                  <div key={leave.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">{leave.student_name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{leave.roll_number}</div>
                      </div>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 font-bold px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {leave.from_date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed">
                      "{leave.reason}"
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveLeave(leave.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 cursor-pointer shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleApproveLeave(leave.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs cursor-pointer border border-rose-500/20 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No pending student leave requests.
                </div>
              )}
            </div>
          </div>

          {/* Announcements block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">My Announcements</h3>
              <Link href="/dashboard/faculty/announcements" className="text-xs font-semibold text-brand-500 flex items-center gap-0.5">
                New <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {data.announcements?.map((ann: any) => (
                <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
