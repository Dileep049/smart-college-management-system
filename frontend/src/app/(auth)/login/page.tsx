'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/app/providers';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preSelectedRole, setPreSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Read optional role preset from landing page shortcuts
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setPreSelectedRole(roleParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  // Pre-fill credentials based on role shortcut for convenient demo evaluation
  const prefillDemoCredentials = (role: string) => {
    if (role === 'student') {
      setValue('email', 'student1@college.edu');
      setValue('password', 'password123');
    } else if (role === 'faculty') {
      setValue('email', 'cse.faculty1@college.edu');
      setValue('password', 'password123');
    } else if (role === 'hod') {
      setValue('email', 'cse.hod@college.edu');
      setValue('password', 'password123');
    } else if (role === 'placement_officer') {
      setValue('email', 'placement@college.edu');
      setValue('password', 'password123');
    } else if (role === 'admin') {
      setValue('email', 'admin@college.edu');
      setValue('password', 'password123');
    }
    setPreSelectedRole(role);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, user } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', user.role);
      
      toast(`Welcome back! Logged in as ${user.role.toUpperCase()}`, 'success');
      
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Banner Column - Hidden on mobile */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-600 to-purple-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="z-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white">
            <span className="w-8 h-8 rounded-lg bg-white text-brand-600 flex items-center justify-center font-black">S</span>
            SmartCollege
          </Link>
        </div>

        <div className="z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white">
            Access your student portal & faculty logs.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Configure classes, mark daily attendance schedules, evaluate academic transcripts, and register for campus placements instantly.
          </p>
        </div>

        <div className="z-10 text-xs text-brand-200">
          &copy; {new Date().getFullYear()} SmartCollege ERP System
        </div>
      </div>

      {/* Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Logo / Title */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 font-bold text-xl text-brand-500">
              <span className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">S</span>
              SmartCollege
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Portal Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Enter your credentials or choose a quick shortcut profile to test the application.
          </p>

          {/* Quick Demo Accounts Selection */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-brand-500" /> Demo Quick Select (Prefills Forms)
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Student', role: 'student' },
                { label: 'Faculty', role: 'faculty' },
                { label: 'HOD', role: 'hod' },
                { label: 'Placement', role: 'placement_officer' },
                { label: 'Admin', role: 'admin' },
              ].map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => prefillDemoCredentials(acc.role)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    preSelectedRole === acc.role
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-350'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:ring-brand-500/20'
                  } rounded-xl focus:outline-none focus:ring-4 focus:border-brand-500 transition-all text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:ring-brand-500/20'
                  } rounded-xl focus:outline-none focus:ring-4 focus:border-brand-500 transition-all text-sm`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-500/25 transition-all card-hover"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
