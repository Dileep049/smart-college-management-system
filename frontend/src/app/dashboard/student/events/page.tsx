'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Calendar, MapPin, Award, CheckCircle, Download, 
  ExternalLink, Users, AlertCircle, Loader2
} from 'lucide-react';
import { useToast } from '@/app/providers';

export default function StudentEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchEventsData = async () => {
    try {
      const res = await api.get('/student/events');
      setEvents(res.data.data.events);
      setRegistrations(res.data.data.registrations);
      setCertificates(res.data.data.certificates);
    } catch (err) {
      toast('Failed to load events. Showing demo catalog.', 'warning');
      setEvents([
        { id: 'e0e0a0e0-0000-0000-0000-000000000001', title: 'Hackathon 2026', description: '36-hour sustainability hackathon.', event_type: 'hackathon', event_date: '2026-06-20T09:00:00.000Z', location: 'Campus Innovation Center', organizer: 'Developer Clubs', registration_deadline: '2026-06-15T18:00:00.000Z' },
        { id: 'e0e0a0e0-0000-0000-0000-000000000002', title: 'Deep Learning Workshop', description: 'Transformer and LLM fine-tuning workshop.', event_type: 'workshop', event_date: '2026-06-25T10:00:00.000Z', location: 'Main Computer Labs', organizer: 'AI Research Lab', registration_deadline: '2026-06-22T23:59:00.000Z' }
      ]);
      setRegistrations([
        { event_id: 'e0e0a0e0-0000-0000-0000-000000000001' }
      ]);
      setCertificates([
        { id: 'c1', event_id: 'e0e0a0e0-0000-0000-0000-000000000001', event_title: 'Hackathon 2026', issued_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, [toast]);

  const handleRegister = async (eventId: string) => {
    setSubmitting(eventId);
    try {
      await api.post('/student/events/register', { event_id: eventId });
      toast('Successfully registered for the event!', 'success');
      fetchEventsData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast(msg, 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDownloadCertificate = async (eventId: string, title: string) => {
    try {
      toast('Preparing PDF certificate...', 'info');
      const res = await api.get(`/student/certificates/${eventId}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `certificate_${title.replace(/\s+/g, '_')}.pdf`;
      link.click();
      toast('Certificate downloaded successfully!', 'success');
    } catch (err) {
      toast('Failed to download PDF. Trying direct render...', 'error');
      window.open(`http://localhost:5000/api/student/certificates/${eventId}/download`);
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some((reg) => reg.event_id === eventId);
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
        <h1 className="text-3xl font-extrabold tracking-tight">Events Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Register for campus technical challenges, workshops, and download credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Catalog */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="font-bold text-lg flex items-center gap-1.5"><Calendar className="w-5 h-5 text-brand-500" /> Active Events Schedule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const registered = isRegistered(evt.id);
              const deadlinePassed = new Date(evt.registration_deadline) < new Date();
              
              return (
                <div key={evt.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-[280px] card-hover">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold uppercase tracking-wider">{evt.event_type}</span>
                      {registered && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Registered
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-extrabold text-base text-slate-800 dark:text-white mt-3 line-clamp-1">{evt.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 space-y-3">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-450">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>
                      <span>Date: {new Date(evt.event_date).toLocaleDateString()}</span>
                    </div>

                    {registered ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-400 font-bold text-xs text-center border border-slate-200/20"
                      >
                        Registered & Active
                      </button>
                    ) : deadlinePassed ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-rose-500 font-bold text-xs text-center border border-rose-500/10"
                      >
                        Registration Closed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(evt.id)}
                        disabled={submitting === evt.id}
                        className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer shadow-sm shadow-brand-500/10 transition-colors"
                      >
                        {submitting === evt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Register for Event'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificates Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-1.5"><Award className="w-5 h-5 text-brand-500" /> Issued Certificates</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Download your digital achievement credentials</p>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 flex-1">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-tight">{cert.event_title || 'Completed Event'}</h4>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleDownloadCertificate(cert.event_id, cert.event_title || 'event_cert')}
                  className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-500 hover:text-white cursor-pointer transition-all border border-brand-500/20"
                  title="Download Certificate PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
                <AlertCircle className="w-8 h-8 text-slate-350 mb-2" />
                <span>No certificates issued yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
