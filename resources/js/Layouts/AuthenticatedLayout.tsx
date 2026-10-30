'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ClinicProLogo } from '@/components/ClinicProLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Stethoscope,
  Calendar,
  CalendarDays,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  User,
  Shield,
  FileText,
  Settings,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const navigation = {
  super_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clinics', href: '/admin/clinics', icon: Building2 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Approvals', href: '/admin/approvals', icon: ClipboardCheck },
  ],
  clinic_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Doctor Approvals', href: '/clinic-admin/approvals', icon: ClipboardCheck },
    { name: 'Doctors', href: '/clinic-admin/doctors', icon: Stethoscope },
    { name: 'Patients', href: '/clinic-admin/patients', icon: Users },
  ],
  doctor: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/doctor/appointments', icon: CalendarDays },
    { name: 'Manage Availability', href: '/doctor/availability', icon: Calendar },
  ],
  patient: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/patient/appointments', icon: CalendarDays },
    { name: 'Book Appointment', href: '/patient/appointments/create', icon: Plus },
  ],
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const page = usePage();
  const { auth, flash } = page.props as {
    auth: {
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
        specialty?: string | null;
        clinic?: { id: number; name: string } | null;
      };
    };
    flash?: {
      success?: string | null;
      error?: string | null;
    };
  };

  const userRole = auth?.user?.role || 'patient';
  const navItems = navigation[userRole as keyof typeof navigation] || navigation.patient;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'clinic_admin':
        return 'bg-blue-50 text-[#0080FF] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'doctor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
    }
  };

  // Close menus on path changes
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [page.url]);

  const initials = auth?.user?.name
    ? auth.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CP';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111726] border-r border-slate-200/80 dark:border-slate-800/80 shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        {/* Brand Logo Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center">
            <ClinicProLogo size="md" />
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tenant/Clinic Indicator if applicable */}
        {auth?.user?.clinic && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-2">
            <Building className="h-4 w-4 text-[#0080FF] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">Clinic</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {auth.user.clinic.name}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== '/dashboard' && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#EAF4FF] text-[#0080FF] font-semibold dark:bg-blue-950/50 dark:text-[#38BDF8] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive
                      ? 'text-[#0080FF] dark:text-[#38BDF8]'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0080FF] dark:bg-[#38BDF8]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0e1422]">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#16134D] to-[#0080FF] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {auth?.user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-md border leading-none',
                    getRoleBadgeClasses(userRole)
                  )}
                >
                  {formatRole(userRole)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#111726]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile logo when sidebar is closed */}
              <div className="lg:hidden">
                <ClinicProLogo size="sm" iconOnly />
              </div>

              {/* Status / Page breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-medium">ClinicPro</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {currentPath === '/dashboard' || !currentPath
                    ? 'Dashboard'
                    : currentPath.split('/')[2]?.replace(/-/g, ' ') || currentPath.split('/')[1]?.replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            {/* Right side tools */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0080FF] ring-2 ring-white dark:ring-slate-900" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#16134D] to-[#0080FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {initials}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[130px] truncate">
                    {auth?.user?.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in-0 zoom-in-95">
                      <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {auth?.user?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {auth?.user?.email}
                        </p>
                        <div className="mt-1.5">
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                              getRoleBadgeClasses(userRole)
                            )}
                          >
                            {formatRole(userRole)}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0080FF]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/two-factor-authentication"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0080FF]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 text-slate-400" />
                          Two-Factor Auth
                        </Link>
                      </div>

                      <div className="py-1">
                        <form action="/logout" method="POST">
                          <input
                            type="hidden"
                            name="_token"
                            value={
                              typeof document !== 'undefined'
                                ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                : ''
                            }
                          />
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Flash Message Banner */}
        {flash?.success && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="font-medium flex-1">{flash.success}</p>
          </div>
        )}
        {flash?.error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm shadow-xs">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="font-medium flex-1">{flash.error}</p>
          </div>
        )}

        {/* Main Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
