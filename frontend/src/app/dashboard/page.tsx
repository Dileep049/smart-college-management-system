'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Sub-dashboards imports
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import FacultyDashboard from '@/components/dashboards/FacultyDashboard';
import HODDashboard from '@/components/dashboards/HODDashboard';
import PlacementDashboard from '@/components/dashboards/PlacementDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    if (!token || !storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Assembling workspace dashboard...</span>
      </div>
    );
  }

  // Render role specific dashboard
  switch (role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'hod':
      return <HODDashboard />;
    case 'placement_officer':
      return <PlacementDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-rose-500">Access Role Invalid</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please sign out and sign in again.</p>
        </div>
      );
  }
}
