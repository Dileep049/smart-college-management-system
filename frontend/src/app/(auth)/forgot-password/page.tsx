'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/app/providers';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast('Verification link sent successfully', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to request reset link.';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden animate-scale-in">
        {/* Design details */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        {isSent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Check your inbox</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              If an account exists for that email, we've sent instructions to reset your password.
            </p>
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-800 text-white font-semibold text-sm text-center hover:bg-slate-750 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Reset Password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Enter the email address associated with your college account and we'll send you a password recovery link.
            </p>

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
                      errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-500/20 transition-all card-hover"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
