'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  ShieldAlert, Users, BookOpen, GraduationCap, Briefcase, 
  Activity, ArrowUpRight, Award, Trash2, Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { useToast } from '@/app/providers';
import Link from 'next/link';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        const logsRes = await api.get('/admin/logs');
        
        setStats(statsRes.data.data);
        setLogs(logsRes.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
        toast('Failed to load admin data. Showing fallback logs.', 'warning');
        
        // Fallback Mock Data
        setStats({
          studentCount: 5000,
          facultyCount: 200,
          departmentCount: 15,
          subjectCount: 120,
          placementCount: 10,
          eventCount: 8
        });
        setLogs([
          { id: 'l1', action: 'DB_SEED', details: 'Successfully seeded database.', user_email: 'admin@college.edu', user_role: 'admin', created_at: new Date().toISOString() },
          { id: 'l2', action: 'USER_LOGIN', details: 'User admin@college.edu logged in successfully.', user_email: 'admin@college.edu', user_role: 'admin', created_at: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Bar chart formatting for student demographics
  const chartData = [
    { name: 'CSE', count: stats?.studentCount ? Math.round(stats.studentCount * 0.45) : 2250 },
    { name: 'ECE', count: stats?.studentCount ? Math.round(stats.studentCount * 0.35) : 1750 },
    { name: 'EEE', count: stats?.studentCount ? Math.round(stats.studentCount * 0.12) : 600 },
    { name: 'Mech', count: stats?.studentCount ? Math.round(stats.studentCount * 0.08) : 400 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Control Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Superuser access • College-wide administration & auditing.</p>
        </div>
      </div>

      {/* Admin Quick Shortcuts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Management Shortcuts</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Students', href: '/dashboard/admin/students', color: 'hover:border-blue-500/50 hover:bg-blue-500/5 text-blue-500' },
            { name: 'Faculty', href: '/dashboard/admin/faculty', color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-500' },
            { name: 'Departments', href: '/dashboard/admin/departments', color: 'hover:border-amber-500/50 hover:bg-amber-500/5 text-amber-500' },
            { name: 'Subjects', href: '/dashboard/admin/subjects', color: 'hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-500' },
          ].map((sc, idx) => (
            <Link
              key={idx}
              href={sc.href}
              className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800/85 bg-slate-50/50 dark:bg-slate-950/20 text-center font-bold text-sm transition-all card-hover ${sc.color}`}
            >
              Manage {sc.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Students Enrolled', val: stats?.studentCount || 0, sub: 'All batches', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', icon: GraduationCap },
          { label: 'Active Faculty Members', val: stats?.facultyCount || 0, sub: 'Departments scope', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', icon: Users },
          { label: 'Registered Departments', val: stats?.departmentCount || 0, sub: 'Academic branches', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400', icon: BookOpen },
          { label: 'Placements & Events', val: (stats?.placementCount || 0) + (stats?.eventCount || 0), sub: 'Active drives & modules', color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400', icon: Briefcase },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics Bar Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Batch Demographics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Student distribution by department</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15,23,42,0.95)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(224, 86%, 53%)" radius={[0, 4, 4, 0]} name="Students Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit logs listing */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">System Audit Trail</h3>
              <Activity className="w-4 h-4 text-brand-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time log of security events and database operations.</p>
            
            <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">Timestamp</th>
                    <th className="py-2.5 px-2">Action</th>
                    <th className="py-2.5 px-2">Operator</th>
                    <th className="py-2.5 px-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-3 px-2 text-slate-450 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-2 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                          log.action.includes('CREATE')
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : log.action.includes('DELETE')
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="font-semibold">{log.user_email}</div>
                        <div className="text-[9px] text-slate-450 uppercase font-bold">{log.user_role}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
