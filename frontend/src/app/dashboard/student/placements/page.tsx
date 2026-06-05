'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Briefcase, Building, DollarSign, CalendarCheck, Send, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/app/providers';

export default function StudentPlacementsPage() {
  const { toast } = useToast();
  const [placements, setPlacements] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlacementsData = async () => {
    try {
      const res = await api.get('/student/placements');
      setPlacements(res.data.data.placements);
      setApplications(res.data.data.applications);
    } catch (err) {
      toast('Failed to load placements. Showing demo board.', 'warning');
      setPlacements([
        { id: 'pl0e0a0e-0000-0000-0000-000000000001', company_name: 'Stripe', role: 'Software Engineer (Frontend/Fullstack)', package: '$120,000 / Year', eligibility: 'Minimum CGPA 8.0, CSE/ECE', deadline: '2026-06-18T12:00:00.000Z' },
        { id: 'pl0e0a0e-0000-0000-0000-000000000002', company_name: 'Tesla', role: 'Embedded Systems Intern', package: '$45 / Hour', eligibility: 'ECE/EEE, basic C++', deadline: '2026-06-25T18:00:00.000Z' }
      ]);
      setApplications([
        { id: 'app1', placement_id: 'pl0e0a0e-0000-0000-0000-000000000001', company_name: 'Stripe', role: 'Software Engineer', package: '$120,000 / Year', status: 'shortlisted', resume_url: '#', applied_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementsData();
  }, [toast]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacementId || !resumeUrl) {
      toast('Please provide a valid resume URL link', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/student/placements/apply', {
        placement_id: selectedPlacementId,
        resume_url: resumeUrl
      });
      toast('Application submitted successfully!', 'success');
      setResumeUrl('');
      setSelectedPlacementId(null);
      fetchPlacementsData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit placement application.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const hasApplied = (placementId: string) => {
    return applications.some((app) => app.placement_id === placementId);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Placement & Internships Drive</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit CVs, track shortlist pipelines, and review corporate packages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Job Listings */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="font-bold text-lg flex items-center gap-1.5"><Briefcase className="w-5 h-5 text-brand-500" /> Active Job Openings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((job) => {
              const applied = hasApplied(job.id);
              const deadlinePassed = new Date(job.deadline) < new Date();
              
              return (
                <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-[280px] card-hover">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-brand-500" />
                        <span className="font-bold text-sm text-slate-850 dark:text-white">{job.company_name}</span>
                      </div>
                      {applied && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Applied
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-extrabold text-base text-slate-850 dark:text-white mt-3 line-clamp-1">{job.role}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      Eligibility: {job.eligibility}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="flex items-center gap-0.5 text-emerald-500"><DollarSign className="w-3.5 h-3.5" /> {job.package}</span>
                      <span className="text-rose-500 uppercase">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>

                    {applied ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-400 font-bold text-xs text-center border border-slate-200/20"
                      >
                        Application Submitted
                      </button>
                    ) : deadlinePassed ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-rose-500 font-bold text-xs text-center border border-rose-500/10"
                      >
                        Applications Closed
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPlacementId(job.id)}
                        className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer shadow-sm shadow-brand-500/10 transition-colors"
                      >
                        Apply for Role
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applications Track list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-1.5"><CalendarCheck className="w-5 h-5 text-brand-500" /> My Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pipeline status of submitted profiles</p>

            {/* Resume Upload Modal (Overlay form) */}
            {selectedPlacementId && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Provide Resume URL</div>
                <form onSubmit={handleApply} className="space-y-3">
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://supabase.co/resumes/my_resume.pdf"
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlacementId(null)}
                      className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-250 dark:hover:bg-slate-750 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
              {applications.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-tight">{app.company_name}</h4>
                      <span className="text-[10px] text-slate-450 font-bold block mt-0.5">{app.role}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      app.status === 'selected'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : app.status === 'shortlisted'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-semibold text-slate-450 border-t border-slate-200/50 dark:border-slate-850 pt-2">
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-brand-500 hover:underline"
                    >
                      Submitted CV <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No applications lodged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
