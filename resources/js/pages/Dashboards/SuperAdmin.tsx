'use client';

import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Settings,
  Activity,
  CalendarDays,
  Shield,
  Calendar,
  Stethoscope,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  stats?: {
    totalClinics: number;
    totalUsers: number;
    pendingApprovals: number;
    totalAppointments: number;
  };
  systemResources?: {
    cpu: number;
    memory: number;
    storage: {
      label: string;
      percentage: number;
    };
  };
  topClinics?: {
    id: number;
    name: string;
    appointments: number;
    growth: string;
  }[];
  userGrowth?: {
    label: string;
    value: string;
    color: string;
  }[];
  recentActivity?: {
    id: string | number;
    category?: string;
    action: string;
    entity: string;
    clinic_name?: string;
    details?: string;
    time: string;
    type?: string;
    link?: string;
  }[];
}

export default function SuperAdminDashboard({
  stats,
  systemResources,
  topClinics = [],
  userGrowth = [],
  recentActivity = [],
}: SuperAdminDashboardProps) {
  const topStats = [
    {
      name: 'Total Clinics',
      value: stats?.totalClinics !== undefined ? String(stats.totalClinics) : '24',
      change: '+12%',
      href: '/admin/clinics',
      icon: Building2,
      color: 'bg-[#0080FF]',
      bgColor: 'bg-[#0080FF]/10 text-[#0080FF]',
    },
    {
      name: 'Total Users',
      value: stats?.totalUsers !== undefined ? String(stats.totalUsers) : '1,234',
      change: '+8%',
      href: '/admin/users',
      icon: Users,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    },
    {
      name: 'Pending Approvals',
      value: stats?.pendingApprovals !== undefined ? String(stats.pendingApprovals) : '18',
      change: '-5%',
      href: '/admin/approvals',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    },
    {
      name: 'Total Bookings',
      value: stats?.totalAppointments !== undefined ? String(stats.totalAppointments) : '99.9%',
      change: '+100%',
      href: '/admin/approvals',
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const quickActions = [
    {
      name: 'Add New Clinic',
      description: 'Register a new clinic in the system',
      icon: Plus,
      href: '/admin/clinics/create',
      color: 'bg-[#0080FF] hover:bg-[#0066CC]',
    },
    {
      name: 'Manage Users',
      description: 'View and manage all system users',
      icon: Users,
      href: '/admin/users',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      name: 'Review Approvals',
      description: 'Check pending appointment approvals',
      icon: ClipboardCheck,
      href: '/admin/approvals',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      name: 'System Settings',
      description: 'Configure security & system profile',
      icon: Settings,
      href: '/profile',
      color: 'bg-slate-600 hover:bg-slate-700',
    },
  ];

  const activityList = recentActivity.length > 0 ? recentActivity : [
    { id: 1, action: 'New clinic registered', entity: 'City Medical Center', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'User role updated', entity: 'Dr. Sarah Johnson', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Appointment approved', entity: 'Booking #APT-2024-001', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'Clinic status updated', entity: 'Health Plus Clinic', time: '1 day ago', type: 'warning' },
  ];

  const topClinicsList = topClinics.length > 0 ? topClinics : [
    { id: 1, name: 'City Medical Center', appointments: 342, growth: '+12%' },
    { id: 2, name: 'Metro Health Clinic', appointments: 287, growth: '+8%' },
    { id: 3, name: 'Family Care Center', appointments: 195, growth: '+5%' },
  ];

  const userGrowthList = userGrowth.length > 0 ? userGrowth : [
    { label: 'This Month', value: '+234', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Last Month', value: '+189', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'This Quarter', value: '+1,247', color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const cpuPercent = systemResources?.cpu ?? 42;
  const memoryPercent = systemResources?.memory ?? 68;
  const storageLabel = systemResources?.storage?.label ?? '3.2 TB / 10 TB';
  const storagePercent = systemResources?.storage?.percentage ?? 32;

  return (
    <>
      <Head title="Super Admin Dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Cross-tenant overview, resource metrics, and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="cursor-pointer rounded-xl">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link href="/admin/clinics">
              <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold gap-1.5 shadow-xs cursor-pointer rounded-xl">
                <Building2 className="h-4 w-4" />
                Manage Clinics
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topStats.map((stat) => (
            <Link key={stat.name} href={stat.href} className="group">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-[#0080FF]/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.name}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-[#0080FF] transition-colors">{stat.value}</p>
                      <p className={cn('text-xs font-semibold mt-1', stat.change.startsWith('-') ? 'text-rose-500' : 'text-emerald-500')}>
                        {stat.change} vs baseline
                      </p>
                    </div>
                    <div className={cn('p-3 rounded-2xl flex items-center justify-center', stat.bgColor)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Quick Actions */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                Quick Actions
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  System Shortcuts
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={cn(
                      'p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#0080FF] dark:hover:border-[#0080FF] transition-all group'
                    )}
                  >
                    <div className={cn('p-2.5 rounded-xl text-white inline-block', action.color, 'group-hover:scale-105 transition-transform')}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#0080FF] transition-colors">{action.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{action.description}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                Recent Activity
                <Link href="/admin/activity" className="text-xs font-semibold text-[#0080FF] hover:underline flex items-center gap-1">
                  View All Activity <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-0">
              <div className="max-h-[300px] overflow-y-auto pr-1.5 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] dark:[scrollbar-color:#334155_transparent]">
                {activityList.map((activity) => {
                  const getCategoryIcon = () => {
                    switch (activity.category) {
                      case 'users':
                        return <Users className="h-4 w-4" />;
                      case 'appointments':
                        return <Calendar className="h-4 w-4" />;
                      case 'prescriptions':
                        return <Stethoscope className="h-4 w-4" />;
                      case 'clinics':
                        return <Building2 className="h-4 w-4" />;
                      default:
                        return <Activity className="h-4 w-4" />;
                    }
                  };

                  const getIconColor = () => {
                    switch (activity.category) {
                      case 'users':
                        return 'bg-blue-50 text-[#0080FF] dark:bg-blue-950/40 dark:text-blue-400';
                      case 'appointments':
                        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
                      case 'prescriptions':
                        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400';
                      case 'clinics':
                        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
                      default:
                        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
                    }
                  };

                  return (
                    <Link
                      key={activity.id}
                      href={activity.link || '/admin/activity'}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    >
                      <div className={cn('p-2 rounded-xl flex-shrink-0 transition-transform group-hover:scale-105', getIconColor())}>
                        {getCategoryIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0080FF] transition-colors truncate">
                            {activity.action}
                          </p>
                          {activity.clinic_name && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">
                              {activity.clinic_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{activity.entity}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5 whitespace-nowrap">{activity.time}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Overview Cards (System Resources, Top Clinics, User Growth) */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* 1. System Resources */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">System Resources</CardTitle>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">CPU Usage</span>
                    <span className="text-slate-900 dark:text-white font-mono">{cpuPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0080FF] rounded-full transition-all duration-500"
                      style={{ width: `${cpuPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Memory Usage</span>
                    <span className="text-slate-900 dark:text-white font-mono">{memoryPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${memoryPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Storage</span>
                    <span className="text-slate-900 dark:text-white font-mono">{storageLabel}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Top Clinics by Appointments */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Top Clinics by Appointments</CardTitle>
              <Link
                href="/admin/clinics"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#0080FF] transition-colors cursor-pointer"
                title="View all clinics"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-1">
                {topClinicsList.map((clinic, index) => (
                  <Link
                    key={clinic.id || index}
                    href={clinic.id ? route('admin.clinics.show', clinic.id) : '/admin/clinics'}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base font-bold text-slate-400 dark:text-slate-600 w-4 text-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-[#0080FF] transition-colors truncate">
                          {clinic.name}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {clinic.growth}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono ml-2 shrink-0">
                      {clinic.appointments}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. User Growth */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">User Growth</CardTitle>
              <Link
                href="/admin/users"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#0080FF] transition-colors cursor-pointer"
                title="View all users"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-1">
                {userGrowthList.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                  >
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className={cn('text-xs font-bold font-mono', item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
