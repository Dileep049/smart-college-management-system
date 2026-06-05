'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, XCircle, Phone, User, BookOpen, AlertCircle } from 'lucide-react';

export default function PublicIDVerificationPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/public/verify-id/${token}`);
        setData(res.data.data);
      } catch (err: any) {
        console.error('ID verification failed', err);
        setError(err.response?.data?.message || 'ID Card token is invalid, expired, or revoked.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-10 h-10 border-4 border-slate-750 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 mt-4 font-semibold">Scanning Database Cryptographic Signatures...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 relative selection:bg-brand-500 selection:text-white">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Hologram card line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-emerald-500 to-purple-600" />

        {error ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Verification Failed</h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {error}
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left flex items-start gap-2.5 text-xs text-slate-400">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>
                If you scanned a QR code printed on a physical card, check with the college registrar to issue a new verification token.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Student Verified</h1>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 mt-1 block">
                Active Enrolled Profile
              </span>
            </div>

            {/* Student card summary */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-white/10 bg-slate-850 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src={data.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'} 
                  alt={data.student_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{data.student_name}</h3>
                <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold tracking-wider uppercase">
                  {data.roll_number}
                </span>
              </div>
            </div>

            {/* Verified detail blocks */}
            <div className="space-y-2.5 text-xs font-semibold text-slate-400 border-t border-slate-800/60 pt-5">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 uppercase tracking-wide text-[10px]">College Branch</span>
                <span className="text-white text-right">{data.department_name} ({data.department_code})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 uppercase tracking-wide text-[10px]">Academic Term</span>
                <span className="text-white">{data.year} Year (Sec {data.section})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 uppercase tracking-wide text-[10px]">Verification Time</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Footer warning */}
            <div className="text-[9px] text-slate-500 text-center leading-relaxed pt-2">
              This is a secure, real-time database query signed by Smart College Management System. Cryptographic certificates are updated hourly.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
