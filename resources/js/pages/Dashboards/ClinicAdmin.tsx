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

export default function ClinicAdminDashboard() {
  const stats = [
    {
      name: 'Total Doctors',
      value: '12',
      change: '+2',
      icon: Stethoscope,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Total Patients',
      value: '342',
      change: '+18',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Pending Approvals',
      value: '7',
      change: '-3',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      name: "Today's Appointments",
      value: '24',
      change: '+5',
      icon: CalendarDays,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
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
      description: 'Check pending appointments',
      icon: ClipboardCheck,
      href: '/clinic-admin/approvals',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      name: 'Manage Schedule',
      description: 'View clinic calendar',
      icon: Calendar,
      href: '/clinic-admin/schedule',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const todaysAppointments = [
    { id: 1, time: '09:00 AM', patient: 'John Smith', doctor: 'Dr. Sarah Johnson', status: 'approved', type: 'Check-up' },
    { id: 2, time: '10:30 AM', patient: 'Maria Garcia', doctor: 'Dr. Michael Chen', status: 'pending', type: 'Consultation' },
    { id: 3, time: '11:15 AM', patient: 'Robert Wilson', doctor: 'Dr. Sarah Johnson', status: 'approved', type: 'Follow-up' },
    { id: 4, time: '02:00 PM', patient: 'Lisa Anderson', doctor: 'Dr. Michael Chen', status: 'pending', type: 'New Patient' },
    { id: 5, time: '03:30 PM', patient: 'David Brown', doctor: 'Dr. Emily Davis', status: 'completed', type: 'Check-up' },
  ];

  const doctorPerformance = [
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
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    <p className={cn('text-sm mt-1', stat.change.startsWith('-') ? 'text-red-500' : 'text-green-500')}>
                      {stat.change} vs last week
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Appointments & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Today's Appointments
                <Link href="/clinic-admin/appointments" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      apt.status === 'pending' && 'border-l-4 border-amber-500',
                      apt.status === 'approved' && 'border-l-4 border-blue-500',
                      apt.status === 'completed' && 'border-l-4 border-green-500',
                    )}
                  >
                    <div className="w-20 text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{apt.patient}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{apt.doctor} • {apt.type}</p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      apt.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                      apt.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    )}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', action.color, 'group-hover:opacity-90')}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{action.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Performance & Clinic Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doctor Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Doctor Performance
                <Link href="/clinic-admin/doctors" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorPerformance.map((doc, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {doc.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{doc.patients} patients this month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{doc.appointments} appts</p>
                      <p className="text-sm text-yellow-500 flex items-center gap-1 justify-end">
                        <span className="h-3 w-3 rounded-full bg-yellow-400" /> {doc.rating}
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