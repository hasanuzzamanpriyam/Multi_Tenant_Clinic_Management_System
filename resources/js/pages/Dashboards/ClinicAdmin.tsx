'use client';

import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Stethoscope,
  ClipboardCheck,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  UserPlus,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicAdminProps {
  metrics?: {
    totalDoctors: number;
    totalPatients: number;
    pendingApprovals: number;
    totalAppointments: number;
  };
  recentAppointments?: {
    id: number;
    time: string;
    patient: string;
    doctor: string;
    status: string;
    type: string;
  }[];
  topDoctors?: {
    name: string;
    appointments: number;
    rating: number;
    patients: number;
  }[];
}

export default function ClinicAdminDashboard({
  metrics,
  recentAppointments = [],
  topDoctors = [],
}: ClinicAdminProps) {
  const stats = [
    {
      name: 'Total Doctors',
      value: metrics ? String(metrics.totalDoctors) : '12',
      change: '+2',
      href: '/clinic-admin/doctors',
      icon: Stethoscope,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 text-[#0080FF]',
    },
    {
      name: 'Total Patients',
      value: metrics ? String(metrics.totalPatients) : '342',
      change: '+18',
      href: '/clinic-admin/patients',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20 text-emerald-600',
    },
    {
      name: 'Pending Approvals',
      value: metrics ? String(metrics.pendingApprovals) : '7',
      change: metrics?.pendingApprovals ? `${metrics.pendingApprovals} pending` : 'All clear',
      href: '/clinic-admin/approvals',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    },
    {
      name: "Total Consultations",
      value: metrics ? String(metrics.totalAppointments) : '24',
      change: '+5 vs last month',
      href: '/clinic-admin/appointments',
      icon: CalendarDays,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const quickActions = [
    {
      name: 'Add Doctor',
      description: 'Register a new doctor',
      icon: UserPlus,
      href: '/clinic-admin/doctors/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Add Patient',
      description: 'Register a new patient',
      icon: Users,
      href: '/clinic-admin/patients/create',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Review Approvals',
      description: 'Check pending doctor applications',
      icon: ClipboardCheck,
      href: '/clinic-admin/approvals',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      name: 'Manage Schedule',
      description: 'View clinic appointments schedule',
      icon: Calendar,
      href: '/clinic-admin/appointments',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const appointmentsList = recentAppointments.length > 0 ? recentAppointments : [
    { id: 1, time: '09:00 AM', patient: 'John Smith', doctor: 'Dr. Sarah Johnson', status: 'approved', type: 'Check-up' },
    { id: 2, time: '10:30 AM', patient: 'Maria Garcia', doctor: 'Dr. Michael Chen', status: 'pending', type: 'Consultation' },
    { id: 3, time: '11:15 AM', patient: 'Robert Wilson', doctor: 'Dr. Sarah Johnson', status: 'approved', type: 'Follow-up' },
    { id: 4, time: '02:00 PM', patient: 'Lisa Anderson', doctor: 'Dr. Michael Chen', status: 'pending', type: 'New Patient' },
    { id: 5, time: '03:30 PM', patient: 'David Brown', doctor: 'Dr. Emily Davis', status: 'completed', type: 'Check-up' },
  ];

  const doctorsList = topDoctors.length > 0 ? topDoctors : [
    { name: 'Dr. Sarah Johnson', appointments: 45, rating: 4.9, patients: 28 },
    { name: 'Dr. Michael Chen', appointments: 38, rating: 4.8, patients: 22 },
    { name: 'Dr. Emily Davis', appointments: 32, rating: 4.7, patients: 19 },
    { name: 'Dr. James Wilson', appointments: 28, rating: 4.6, patients: 15 },
  ];

  return (
    <>
      <Head title="Clinic Admin Dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinic Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your clinic's operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/clinic-admin/appointments">
              <Button variant="outline" size="sm" className="rounded-xl cursor-pointer">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </Link>
            <Link href="/clinic-admin/approvals">
              <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold gap-1.5 shadow-xs rounded-xl cursor-pointer">
                <ClipboardCheck className="h-4 w-4" />
                Doctor Approvals
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href} className="group">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-[#0080FF]/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.name}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-[#0080FF] transition-colors">{stat.value}</p>
                      <p className="text-xs font-semibold mt-1 text-slate-500 dark:text-slate-400">
                        {stat.change}
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

        {/* Today's Appointments & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Today's Appointments */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Recent Consultations
                <Link href="/clinic-admin/appointments" className="text-xs font-semibold text-[#0080FF] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentsList.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'flex items-center gap-4 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                      apt.status === 'pending' && 'border-l-4 border-l-amber-500',
                      apt.status === 'approved' && 'border-l-4 border-l-[#0080FF]',
                      apt.status === 'completed' && 'border-l-4 border-l-emerald-500',
                    )}
                  >
                    <div className="w-20 text-center flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{apt.patient}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{apt.doctor} • {apt.type}</p>
                    </div>
                    <span className={cn(
                      'px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize',
                      apt.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                      apt.status === 'approved' ? 'bg-blue-100 text-[#0080FF] dark:bg-blue-900/30 dark:text-blue-300' :
                      apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                    )}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#0080FF] transition-all group'
                    )}
                  >
                    <div className={cn('p-2 rounded-xl', action.color, 'group-hover:scale-105 transition-transform')}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-[#0080FF] transition-colors">{action.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{action.description}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0080FF] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Performance & Clinic Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doctor Performance */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Doctor Performance
                <Link href="/clinic-admin/doctors" className="text-xs font-semibold text-[#0080FF] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctorsList.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-xs text-[#0080FF]">
                        {doc.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{doc.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.patients} patients this month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{doc.appointments} appts</p>
                      <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 justify-end">
                        ★ {doc.rating}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinic Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clinic Metrics</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Appointments This Month</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">342</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Patient Satisfaction</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">4.8/5.0</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">+0.2 from last quarter</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue This Month</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">$48,750</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">+8% from last month</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Wait Time</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">12 min</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">-3 min from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Appointment Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Appointment Trend</CardTitle>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {[
                { day: 'Mon', value: 35, max: 50 },
                { day: 'Tue', value: 42, max: 50 },
                { day: 'Wed', value: 38, max: 50 },
                { day: 'Thu', value: 45, max: 50 },
                { day: 'Fri', value: 40, max: 50 },
                { day: 'Sat', value: 28, max: 50 },
                { day: 'Sun', value: 15, max: 50 },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center justify-end gap-2">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(item.value / item.max) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}