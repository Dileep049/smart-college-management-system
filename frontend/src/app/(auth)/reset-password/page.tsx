'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/app/providers';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token') || '';
    setToken(tokenParam);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast('Invalid or missing reset token', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast('Password reset successfully', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password.';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Password Updated</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl bg-brand-500 text-white font-semibold text-sm text-center hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Create New Password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Please choose a strong password that you haven't used before.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Token Input - fallback if token not in URL */}
              {!searchParams.get('token') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Reset Token / Email Address
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token or email address"
                    className="block w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border ${
                      errors.password ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-500/20 transition-all card-hover"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
