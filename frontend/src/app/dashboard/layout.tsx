'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  GraduationCap, BookOpen, Users, FileText, Calendar, Briefcase, 
  UserCheck, Shield, ClipboardList, Clock, LogOut, Sun, Moon, 
  Menu, X, Book, Award, Bell, Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme, useToast } from '../providers';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Portal User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userTitle, setUserTitle] = useState<string>('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const storedRole = localStorage.getItem('role');
        const token = localStorage.getItem('token');
        if (!token || !storedRole) {
          router.push('/login');
          return;
        }
        setRole(storedRole);

        // Fetch detailed profile info from /api/auth/me
        const res = await api.get('/auth/me');
        const { user, profile } = res.data.data;
        setUserEmail(user.email);
        
        if (profile) {
          setUserName(profile.name);
          if (user.role === 'student') {
            setUserTitle(`${profile.roll_number} • Year ${profile.year}-${profile.section}`);
          } else if (user.role === 'faculty' || user.role === 'hod') {
            setUserTitle(profile.designation);
          } else if (user.role === 'placement_officer') {
            setUserTitle('Placement Officer');
          }
        } else {
          setUserName(user.role.toUpperCase() + ' User');
          setUserTitle(user.role.toUpperCase() + ' Portal');
        }
      } catch (err) {
        console.error('Failed to load session details', err);
        // Fallback for offline/demo if DB fails to respond
        const savedRole = localStorage.getItem('role');
        if (savedRole) {
          setRole(savedRole);
          setUserName(savedRole.charAt(0).toUpperCase() + savedRole.slice(1) + ' User (Demo)');
          setUserTitle(savedRole.toUpperCase() + ' Portal');
        } else {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast('Logged out successfully', 'info');
    router.push('/login');
  };

  // Get navigation links based on user role
  const getNavItems = (): SidebarItem[] => {
    switch (role) {
      case 'student':
        return [
          { name: 'Dashboard Overview', href: '/dashboard', icon: ClipboardList },
          { name: 'Attendance Record', href: '/dashboard/student/attendance', icon: UserCheck },
          { name: 'Marks View', href: '/dashboard/student/marks', icon: Award },
          { name: 'Leave Requests', href: '/dashboard/student/leave', icon: Clock },
          { name: 'Study Materials', href: '/dashboard/student/materials', icon: BookOpen },
          { name: 'Campus Events', href: '/dashboard/student/events', icon: Calendar },
          { name: 'Placements', href: '/dashboard/student/placements', icon: Briefcase },
          { name: 'Digital ID Card', href: '/dashboard/student/id-card', icon: GraduationCap },
        ];
      case 'faculty':
        return [
          { name: 'Dashboard Analytics', href: '/dashboard', icon: ClipboardList },
          { name: 'Mark Attendance', href: '/dashboard/faculty/attendance', icon: UserCheck },
          { name: 'Upload Marks', href: '/dashboard/faculty/marks', icon: Award },
          { name: 'Approve Leaves', href: '/dashboard/faculty/leaves', icon: Clock },
          { name: 'Study Notes', href: '/dashboard/faculty/notes', icon: BookOpen },
          { name: 'Post Announcement', href: '/dashboard/faculty/announcements', icon: Bell },
        ];
      case 'hod':
        return [
          { name: 'Department Analytics', href: '/dashboard', icon: ClipboardList },
          { name: 'Mark Attendance', href: '/dashboard/faculty/attendance', icon: UserCheck },
          { name: 'Upload Marks', href: '/dashboard/faculty/marks', icon: Award },
          { name: 'Student Leaves', href: '/dashboard/faculty/leaves', icon: Clock },
          { name: 'Save Study Notes', href: '/dashboard/faculty/notes', icon: BookOpen },
          { name: 'Post Announcement', href: '/dashboard/faculty/announcements', icon: Bell },
          { name: 'Students Directory', href: '/dashboard/hod/students', icon: Users },
          { name: 'Manage Timetable', href: '/dashboard/hod/timetable', icon: Calendar },
        ];
      case 'placement_officer':
        return [
          { name: 'Placement Analytics', href: '/dashboard', icon: ClipboardList },
          { name: 'Create Job Posting', href: '/dashboard/placement-officer/postings', icon: Briefcase },
          { name: 'Review Applications', href: '/dashboard/placement-officer/applications', icon: FileText },
        ];
      case 'admin':
        return [
          { name: 'System Overview', href: '/dashboard', icon: Shield },
          { name: 'Manage Students', href: '/dashboard/admin/students', icon: Users },
          { name: 'Manage Faculty', href: '/dashboard/admin/faculty', icon: UserCheck },
          { name: 'Manage Departments', href: '/dashboard/admin/departments', icon: Book },
          { name: 'Manage Subjects', href: '/dashboard/admin/subjects', icon: BookOpen },
          { name: 'Audit Logs', href: '/dashboard/admin/logs', icon: Activity },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-brand-500 animate-spin" />
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">Authorizing secure session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ==========================================
          DESKTOP SIDEBAR
          ========================================== */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800/80 z-20 shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/20 shrink-0">
              S
            </div>
            {!isSidebarCollapsed && (
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SmartCollege
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* User Mini Profile */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-b border-slate-800/40 bg-slate-950/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{userName}</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">{userTitle}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer group ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom */}
        <div className="p-3 border-t border-slate-800/60 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ==========================================
          MOBILE DRAWER SIDEBAR
          ========================================== */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}>
          <aside 
            className="w-64 h-full bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                  S
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">SmartCollege</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400">
                  {userName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{userName}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{userTitle}</div>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/60">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ==========================================
          MAIN CONTENT WORKSPACE
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-extrabold text-slate-800 dark:text-white tracking-tight hidden md:block capitalize">
              {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme mode"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{userName}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{role}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-sm">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Panels Scroll */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
