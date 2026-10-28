'use client';

import { ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Stethoscope,
  Calendar,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Home,
  FileText,
  User,
  Shield,
  CalendarDays,
  Plus,
  ArrowRight,
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
    { name: 'Approvals', href: '/clinic-admin/approvals', icon: ClipboardCheck },
    { name: 'Doctors', href: '/clinic-admin/doctors', icon: Stethoscope },
    { name: 'Patients', href: '/clinic-admin/patients', icon: Users },
  ],
  doctor: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/doctor/appointments', icon: CalendarDays },
    { name: 'Availability', href: '/doctor/availability', icon: Calendar },
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

  const { auth } = usePage().props as {
    auth: {
      user: {
        name: string;
        email: string;
        role: string;
      };
    };
  };

  const userRole = auth.user.role;
  const navItems = navigation[userRole as keyof typeof navigation] || [];

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLogout = () => {
    document.getElementById('logout-form')?.submit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
            >
              <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span>ClinicPro</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {auth.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {auth.user.email}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  userRole === 'super_admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : userRole === 'clinic_admin'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : userRole === 'doctor'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {formatRole(userRole)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const path = window.location.pathname;
                  if (path === '/dashboard') return 'Dashboard';
                  const segments = path.split('/').filter(Boolean);
                  return segments[segments.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Dashboard';
                })()}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search"
                />
              </div>

              {/* Notifications */}
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {auth.user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{auth.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/two-factor-authentication"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Two-Factor Auth
                        </Link>
                        <Link
                          href="/user/sessions"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          Sessions
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                        <form id="logout-form" action="/logout" method="POST">
                          <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  );
}