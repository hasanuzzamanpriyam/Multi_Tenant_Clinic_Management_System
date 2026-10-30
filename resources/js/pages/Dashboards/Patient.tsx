'use client';

import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Plus,
  ArrowRight,
  HeartPulse,
  Shield,
  Star,
  MessageSquare,
  Pill,
  Clock,
  Stethoscope,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PatientDashboard() {
  const stats = [
    {
      name: 'Upcoming Appointments',
      value: '3',
      change: 'Next: Dec 18, 10:00 AM',
      icon: CalendarDays,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Completed Visits',
      value: '12',
      change: 'This year',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Active Prescriptions',
      value: '2',
      change: 'Refill due in 14 days',
      icon: Pill,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      name: 'Health Score',
      value: '92/100',
      change: 'Excellent',
      icon: HeartPulse,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const upcomingAppointments = [
    { id: 1, date: 'Tomorrow, Dec 18', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', type: 'Follow-up', status: 'approved', location: 'Room 204, Building A' },
    { id: 2, date: 'Thu, Dec 19', time: '02:30 PM', doctor: 'Dr. Michael Chen', specialty: 'Dermatology', type: 'Consultation', status: 'pending', location: 'Room 105, Building B' },
    { id: 3, date: 'Mon, Dec 23', time: '09:00 AM', doctor: 'Dr. Emily Davis', specialty: 'General Practice', type: 'Annual Check-up', status: 'approved', location: 'Room 301, Building A' },
  ];

  const pastAppointments = [
    { id: 4, date: 'Dec 10, 2024', time: '11:00 AM', doctor: 'Dr. Sarah Johnson', type: 'Follow-up', status: 'completed', notes: 'Blood pressure stable, continue current medication' },
    { id: 5, date: 'Nov 28, 2024', time: '03:00 PM', doctor: 'Dr. Michael Chen', type: 'Consultation', status: 'completed', notes: 'Prescribed topical cream for eczema' },
    { id: 6, date: 'Nov 15, 2024', time: '10:00 AM', doctor: 'Dr. Emily Davis', type: 'Annual Check-up', status: 'completed', notes: 'All vitals normal, recommended flu shot' },
  ];

  const quickActions = [
    {
      name: 'Book Appointment',
      description: 'Schedule a new visit with your doctor',
      icon: Plus,
      href: '/patient/appointments/create',
      color: 'bg-blue-500 hover:bg-blue-600',
      primary: true,
    },
    {
      name: 'View Medical Records',
      description: 'Access your health history and test results',
      icon: FileText,
      href: '/patient/records',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Message Doctor',
      description: 'Send a secure message to your care team',
      icon: MessageSquare,
      href: '/patient/messages',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Request Refill',
      description: 'Request prescription refills online',
      icon: Pill,
      href: '/patient/prescriptions',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  const healthMetrics = [
    { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'normal', trend: 'stable' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', trend: 'down' },
    { label: 'BMI', value: '23.4', unit: '', status: 'normal', trend: 'stable' },
    { label: 'Cholesterol', value: '185', unit: 'mg/dL', status: 'good', trend: 'down' },
    { label: 'Blood Sugar', value: '92', unit: 'mg/dL', status: 'normal', trend: 'stable' },
    { label: 'Steps Today', value: '8,432', unit: 'steps', status: 'active', trend: 'up' },
  ];

  const notifications = [
    { id: 1, title: 'Appointment Confirmed', message: 'Your appointment with Dr. Sarah Johnson on Dec 18 at 10:00 AM has been confirmed.', time: '2 hours ago', type: 'success', read: false },
    { id: 2, title: 'Prescription Ready', message: 'Your prescription for Lisinopril 10mg is ready for pickup at the pharmacy.', time: '5 hours ago', type: 'info', read: false },
    { id: 3, title: 'Test Results Available', message: 'Your recent blood test results are now available in your medical records.', time: '1 day ago', type: 'info', read: true },
    { id: 4, title: 'Appointment Reminder', message: 'Reminder: You have an appointment tomorrow at 10:00 AM with Dr. Sarah Johnson.', time: '2 days ago', type: 'warning', read: true },
  ];

  return (
    <>
      <Head title="Patient Dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your health and appointments</p>
          </div>
          <Link href={route('patient.appointments.create')}>
            <Button size="lg" className="w-full sm:w-auto bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold gap-2 shadow-xs">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.change}</p>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Appointments & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Upcoming Appointments
                </div>
                <Link href="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      apt.status === 'pending' && 'border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
                      apt.status === 'approved' && 'border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/10',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{apt.doctor}</p>
                            <Badge variant={cn(
                              apt.status === 'pending' ? 'secondary' :
                              'default'
                            )}>
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{apt.specialty} • {apt.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{apt.date} at {apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{apt.location}</span>
                        </div>
                        {apt.status === 'pending' && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending Approval
                          </Badge>
                        )}
                        {apt.status === 'approved' && (
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
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
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border transition-colors group',
                      action.primary
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', action.color)}>
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

        {/* Health Metrics & Notifications */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Health Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Health Metrics
              </CardTitle>
              <Link href="/patient/health-metrics" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {healthMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className={cn(
                      'p-4 rounded-lg border border-gray-200 dark:border-gray-700',
                      metric.status === 'normal' && 'border-l-4 border-green-500',
                      metric.status === 'good' && 'border-l-4 border-blue-500',
                      metric.status === 'active' && 'border-l-4 border-purple-500',
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</span>
                      <Badge variant={cn(
                        metric.status === 'normal' ? 'outline' :
                        metric.status === 'good' ? 'default' :
                        'secondary'
                      )}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                      {metric.unit && <span className="text-sm text-gray-500 dark:text-gray-400">{metric.unit}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />}
                      {metric.trend === 'stable' && <span className="h-4 w-4 text-gray-400">—</span>}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Notifications
              </CardTitle>
              <Link href="/patient/notifications" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      !notif.read && 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-full flex-shrink-0 mt-0.5',
                        notif.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        notif.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {notif.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {notif.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                        {notif.type === 'info' && <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">{notif.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Past Appointments & Care Team */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Past Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Recent Visits
              </CardTitle>
              <Link href="/patient/appointments?tab=past" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{apt.doctor}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{apt.type} • {apt.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                      View Notes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Team */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Your Care Team
              </CardTitle>
              <Link href="/patient/care-team" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', role: 'Primary Cardiologist', avatar: 'SJ' },
                  { name: 'Dr. Michael Chen', specialty: 'Dermatology', role: 'Dermatologist', avatar: 'MC' },
                  { name: 'Dr. Emily Davis', specialty: 'General Practice', role: 'Primary Care Physician', avatar: 'ED' },
                ].map((doctor, index) => (
                  <Link
                    key={index}
                    href={`/patient/doctors/${index + 1}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-600 dark:text-purple-400">{doctor.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{doctor.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-500">
                        Active
                      </Badge>
                      <MessageSquare className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Tips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              Health Tips for You
            </CardTitle>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Stay Active', description: 'Aim for at least 150 minutes of moderate aerobic activity per week. Your 8,432 steps today is a great start!', icon: Activity, color: 'bg-blue-500' },
                { title: 'Medication Adherence', description: 'Take your medications as prescribed. Set up reminders for your 2 active prescriptions to never miss a dose.', icon: Pill, color: 'bg-amber-500' },
                { title: 'Preventive Care', description: 'Your annual check-up is coming up on Dec 23. Regular screenings help catch issues early.', icon: Shield, color: 'bg-green-500' },
              ].map((tip, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-tip-color transition-colors">
                  <div className={cn('p-3 rounded-lg', tip.color)}>
                    <tip.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-3 font-medium text-gray-900 dark:text-white">{tip.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}