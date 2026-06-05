'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Shield, Award, Users, CheckCircle, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-900 text-slate-100 overflow-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
            S
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SmartCollege
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-medium hover:opacity-90 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all card-hover"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 hover:bg-slate-750 text-white font-medium hover:border-slate-600 transition-all card-hover"
            >
              Sign In to Portal
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6 animate-fade-in">
          <GraduationCap className="w-4 h-4" /> Next-Gen Enterprise College ERP
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up">
          Manage College Operations with <br />
          <span className="gradient-text">Unified Intelligence</span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          An integrated SaaS dashboard built for students, HODs, faculty members, and placement officers. Experience modern academics with digital ID cards, real-time analytics, and event management.
        </p>

        {/* Roles Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { label: 'Students', desc: 'Grades, ID & Attendance', link: '/login?role=student', color: 'hover:border-brand-500/50 hover:bg-brand-500/5' },
            { label: 'Faculty', desc: 'Class Marker & Grades', link: '/login?role=faculty', color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5' },
            { label: 'HODs', desc: 'Department Reports', link: '/login?role=hod', color: 'hover:border-amber-500/50 hover:bg-amber-500/5' },
            { label: 'Placements', desc: 'Company Applications', link: '/login?role=placement_officer', color: 'hover:border-purple-500/50 hover:bg-purple-500/5' },
          ].map((r, i) => (
            <Link
              key={i}
              href={r.link}
              className={`p-5 rounded-2xl bg-slate-800/40 border border-slate-750 text-left transition-all group card-hover ${r.color}`}
            >
              <h3 className="font-bold text-white group-hover:text-white transition-colors">{r.label}</h3>
              <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
            </Link>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 border-t border-slate-800 pt-10 w-full max-w-2xl text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div>
            <div className="text-3xl font-extrabold text-white">5,000+</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Active Students</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">98%</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Placement Rate</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">200+</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Faculty Members</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-t border-slate-800/50 text-xs text-slate-500 z-10">
        <div>&copy; {new Date().getFullYear()} SmartCollege Inc. All rights reserved.</div>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
