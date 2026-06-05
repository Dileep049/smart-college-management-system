'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  ShieldCheck, Phone, Mail, Award, MapPin, 
  RefreshCw, GraduationCap, CheckCircle
} from 'lucide-react';
import { useToast } from '@/app/providers';

export default function DigitalIDCardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchIDCard = async () => {
      try {
        const res = await api.get('/student/id-card');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load ID card', err);
        toast('Failed to load ID card details. Loading demo profile.', 'warning');
        
        // Mock fallback data
        setData({
          profile: {
            name: 'Alice Johnson',
            roll_number: 'CS23B1001',
            department_name: 'Computer Science & Engineering',
            department_code: 'CSE',
            year: 3,
            section: 'A',
            phone: '+1 555-0101',
            email: 'student1@college.edu',
            profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
          },
          card: {
            qr_code: 'http://localhost:3000/verify-id/token_alice_123',
            verification_token: 'token_alice_123'
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchIDCard();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-350 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 mt-4 font-medium">Assembling Digital ID Card...</span>
      </div>
    );
  }

  // Fallback QR code render helper using a third-party API or generating a simple canvas if qrcode library isn't loaded
  const qrCodeImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data?.card?.qr_code || 'http://localhost:3000/verify-id/' + data?.card?.verification_token)}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Digital Student ID Card</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Tap the card to flip and scan the verification QR code.
        </p>
      </div>

      {/* ID Card Wrapper with Perspective for Flipping */}
      <div className="w-[340px] h-[520px] cursor-pointer relative group [perspective:1000px] mt-6" onClick={() => setIsFlipped(!isFlipped)}>
        {/* Flip Inner Container */}
        <div className={`relative w-full h-full rounded-3xl shadow-2xl transition-all duration-750 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}>
          {/* ==========================================
              CARD FRONT VIEW
              ========================================== */}
          <div className="absolute inset-0 w-full h-full rounded-3xl [backface-visibility:hidden] overflow-hidden flex flex-col justify-between p-6 border border-slate-200/50 dark:border-slate-800 bg-slate-900 text-white shadow-2xl">
            {/* Holographic BG overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/20 via-purple-600/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
            
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                  S
                </div>
                <div>
                  <div className="text-xs font-black tracking-wider uppercase text-white leading-tight">Smart College</div>
                  <div className="text-[8px] font-bold tracking-widest text-slate-400 uppercase">Identity Card</div>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex flex-col items-center text-center my-auto z-10">
              {/* Profile Image Frame with glowing border */}
              <div className="relative mb-4">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 opacity-75 blur animate-pulse" />
                <div className="relative w-28 h-28 rounded-full bg-slate-800 border-2 border-white/90 overflow-hidden flex items-center justify-center">
                  <img 
                    src={data.profile?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'} 
                    alt={data.profile?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-black tracking-tight text-white mb-1">{data.profile?.name}</h2>
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/35 text-xs font-bold tracking-wider">
                {data.profile?.roll_number}
              </span>

              {/* Course & Batch */}
              <div className="mt-5 space-y-1 w-full border-t border-white/5 pt-4 text-xs font-semibold text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase tracking-wide text-[10px]">Department</span>
                  <span className="text-white text-right">{data.profile?.department_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase tracking-wide text-[10px]">Year / Batch</span>
                  <span className="text-white">{data.profile?.year} Year (Sec {data.profile?.section})</span>
                </div>
              </div>
            </div>

            {/* Verified seal / Footer */}
            <div className="border-t border-white/10 pt-4 flex justify-between items-center z-10 shrink-0 text-[10px] text-slate-400 font-bold">
              <div>
                <span className="block uppercase text-[8px] text-slate-500">Academic Term</span>
                <span className="text-white">2023 - 2027</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" /> SECURE RFID
              </div>
            </div>
          </div>

          {/* ==========================================
              CARD BACK VIEW
              ========================================== */}
          <div className="absolute inset-0 w-full h-full rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden flex flex-col justify-between p-6 border border-slate-200/50 dark:border-slate-800 bg-slate-900 text-white shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            
            <div className="text-center z-10">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">ID Verification Portal</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Scan to query secure academic records</p>
            </div>

            {/* QR Scanner visual grid */}
            <div className="relative flex flex-col items-center justify-center my-auto z-10">
              <div className="relative p-2.5 bg-white rounded-2xl shadow-xl shadow-slate-950/50 border-4 border-brand-500">
                {/* Scanner alignment corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 -mt-1.5 -ml-1.5" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 -mt-1.5 -mr-1.5" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 -mb-1.5 -ml-1.5" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 -mb-1.5 -mr-1.5" />
                
                <img 
                  src={qrCodeImageSrc} 
                  alt="Verification QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-4 tracking-wider uppercase">
                TOKEN: {data.card?.verification_token}
              </span>
            </div>

            {/* Emergency Info and Terms */}
            <div className="border-t border-white/10 pt-4 z-10 text-[10px] text-slate-400 space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[9px]">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>Emergency: +1 555-9111</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>Email: support@college.edu</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-tight">
                This digital card is property of Smart College and serves as an official identity document. Scanning verifies credentials in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 font-semibold text-sm cursor-pointer shadow-sm transition-all card-hover mt-4"
      >
        <RefreshCw className="w-4 h-4" /> Flip Digital ID Card
      </button>
    </div>
  );
}
