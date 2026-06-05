'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Briefcase, FileText, CheckCircle, Clock, 
  ExternalLink, User, Building, DollarSign, ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/app/providers';
import Link from 'next/link';

export default function PlacementDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const postingsRes = await api.get('/placements/postings');
        const applicationsRes = await api.get('/placements/applications');
        
        setData({
          postings: postingsRes.data.data,
          applications: applicationsRes.data.data
        });
      } catch (err) {
        console.error('Failed to load placement dashboard', err);
        toast('Failed to load dashboard data. Showing demo fallback.', 'warning');
        
        // Demo Fallback Data
        setData({
          postings: [
            { id: 'pl1', company_name: 'Stripe', role: 'Software Engineer', package: '$120,000 / Year', eligibility: 'CGPA 8.0, CSE/ECE', deadline: '2026-06-18T12:00:00.000Z' },
            { id: 'pl2', company_name: 'Tesla', role: 'Embedded Systems Intern', package: '$45 / Hour', eligibility: 'ECE/EEE, C++', deadline: '2026-06-25T18:00:00.000Z' }
          ],
          applications: [
            { id: 'app1', company_name: 'Stripe', role: 'Software Engineer', student_name: 'Alice Johnson', roll_number: 'CS23B1001', department_code: 'CSE', resume_url: '#', status: 'shortlisted', applied_at: new Date().toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  const handleUpdateStatus = async (appId: string, status: 'shortlisted' | 'selected' | 'rejected') => {
    try {
      await api.patch(`/placements/applications/${appId}`, { status });
      toast(`Application status updated to ${status.toUpperCase()}`, 'success');
      
      // Update local state
      setData((prev: any) => ({
        ...prev,
        applications: prev.applications.map((app: any) => 
          app.id === appId ? { ...app, status } : app
        )
      }));
    } catch (err) {
      toast('Failed to update application status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Stats calculation
  const totalPostings = data.postings?.length || 0;
  const totalApplications = data.applications?.length || 0;
  const selectedCount = data.applications?.filter((a: any) => a.status === 'selected').length || 0;
  const pendingCount = data.applications?.filter((a: any) => a.status === 'applied').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Placement Officer Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage corporate outreach, listings, and applications.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/placement-officer/postings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm cursor-pointer shadow-md shadow-brand-500/20 transition-all card-hover"
          >
            Create Job Listing
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        {[
          { label: 'Corporate Openings', val: totalPostings, sub: 'Active drives', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', icon: Briefcase },
          { label: 'Student Applications', val: totalApplications, sub: 'Total submissions', color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400', icon: FileText },
          { label: 'Placed Students', val: selectedCount, sub: 'Offers confirmed', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', icon: CheckCircle },
          { label: 'Unreviewed Profiles', val: pendingCount, sub: 'Awaiting checks', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400', icon: Clock },
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
        {/* Applications table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-1">Student Job Applications</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Review and update status logs for student CV submissions.</p>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Job Drive</th>
                  <th className="py-3 px-2">Resume</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {data.applications?.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-850 dark:text-white leading-tight">{app.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{app.roll_number} • {app.department_code}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{app.company_name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{app.role}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-500 font-bold hover:underline"
                      >
                        PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        app.status === 'selected'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : app.status === 'shortlisted'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {app.status === 'applied' || app.status === 'shortlisted' ? (
                        <div className="inline-flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleUpdateStatus(app.id, app.status === 'applied' ? 'shortlisted' : 'selected')}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow-sm transition-colors"
                          >
                            {app.status === 'applied' ? 'Shortlist' : 'Select'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer border border-rose-500/20 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.applications?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Postings panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-1">Company Listings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Active corporate placement postings</p>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {data.postings?.map((post: any) => (
              <div key={post.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between h-36">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-brand-500" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{post.company_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{post.role}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Eligibility: {post.eligibility}</div>
                </div>
                <div className="flex items-center justify-between mt-3 border-t border-slate-200/50 dark:border-slate-850 pt-2 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-0.5 text-emerald-500">
                    <DollarSign className="w-3.5 h-3.5" /> {post.package}
                  </span>
                  <span className="text-rose-500 uppercase">
                    Deadline: {new Date(post.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {data.postings?.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active placement postings.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
