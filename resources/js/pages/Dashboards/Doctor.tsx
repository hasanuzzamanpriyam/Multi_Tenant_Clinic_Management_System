'use client';

import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Stethoscope,
  Plus,
  ArrowRight,
  TrendingUp,
  User,
  Activity,
  FileText,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DoctorDashboard() {
  const stats = [
    {
      name: "Today's Appointments",
      value: '8',
      change: '2 pending',
      icon: CalendarDays,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Completed This Week',
      value: '24',
      change: '+3 vs last week',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Total Patients',
      value: '87',
      change: '+5 this month',
      icon: User,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      name: 'Avg. Rating',
      value: '4.9',
      change: 'Based on 124 reviews',
      icon: HeartPulse,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const todaysSchedule = [
    { id: 1, time: '09:00 AM', patient: 'John Smith', type: 'Annual Check-up', status: 'confirmed', duration: '30 min', notes: 'Routine physical exam' },
    { id: 2, time: '10:00 AM', patient: 'Maria Garcia', type: 'Follow-up', status: 'confirmed', duration: '20 min', notes: 'Blood pressure check' },
    { id: 3, time: '11:00 AM', patient: 'Robert Wilson', type: 'Consultation', status: 'pending', duration: '30 min', notes: 'New patient - chest pain' },
    { id: 4, time: '02:00 PM', patient: 'Lisa Anderson', type: 'Follow-up', status: 'confirmed', duration: '15 min', notes: 'Medication review' },
    { id: 5, time: '03:00 PM', patient: 'David Brown', type: 'Annual Check-up', status: 'completed', duration: '30 min', notes: 'All vitals normal' },
    { id: 6, time: '04:00 PM', patient: 'Sarah Johnson', type: 'Consultation', status: 'pending', duration: '30 min', notes: 'Skin rash evaluation' },
  ];

  const upcomingAppointments = [
    { date: 'Tomorrow', count: 6, patients: ['John Smith', 'Maria Garcia', 'Robert Wilson', 'Lisa Anderson', 'David Brown', 'Sarah Johnson'] },
    { date: 'Wed, Dec 18', count: 5, patients: ['Michael Chen', 'Emily Davis', 'James Wilson', 'Sarah Taylor', 'Robert Martinez'] },
    { date: 'Thu, Dec 19', count: 4, patients: ['Jennifer Lee', 'Christopher Clark', 'Amanda White', 'Daniel Harris'] },
    { date: 'Fri, Dec 20', count: 3, patients: ['Matthew Lewis', 'Ashley Walker', 'Joshua Hall'] },
  ];

  const quickActions = [
    {
      name: 'Manage Availability',
      description: 'Set your weekly schedule',
      icon: Clock,
      href: '/doctor/availability',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'View All Appointments',
      description: 'See your complete schedule',
      icon: CalendarDays,
      href: '/doctor/appointments',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Patient Records',
      description: 'Access patient history',
      icon: FileText,
      href: '/doctor/patients',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Clinical Notes',
      description: 'Review and add notes',
      icon: Stethoscope,
      href: '/doctor/notes',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <Head title="Doctor Dashboard" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your appointments and patients</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            Print Schedule
          </Button>
          <Link href={route('doctor.availability.index')}>
            <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              Manage Availability
            </Button>
          </Link>
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

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Today's Schedule
            </div>
            <Link href="/doctor/appointments" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysSchedule.map((apt) => (
              <div
                key={apt.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                  apt.status === 'pending' && 'border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
                  apt.status === 'confirmed' && 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
                  apt.status === 'completed' && 'border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/10',
                )}
              >
                <div className="w-24 text-center flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{apt.time}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{apt.duration}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{apt.patient}</p>
                    <Badge variant={cn(
                      apt.status === 'pending' ? 'secondary' :
                      apt.status === 'confirmed' ? 'default' :
                      'outline'
                    )}>
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{apt.type}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{apt.notes}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="w-20">Confirm</Button>
                      <Button size="sm" variant="destructive" className="w-20">Decline</Button>
                    </div>
                  )}
                  {apt.status === 'confirmed' && (
                    <Button size="sm" className="w-28" onClick={() => {}}>
                      Complete
                    </Button>
                  )}
                  {apt.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Upcoming */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
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
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{action.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Upcoming Week
              </div>
              <Link href="/doctor/appointments" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((day) => (
                <div key={day.date} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{day.date}</span>
                    <Badge variant="outline">{day.count} appointments</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {day.patients.map((patient, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {patient}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Stats & Patient Demographics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Activity</CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Appointments Completed', value: 24, target: 28, color: 'bg-green-500' },
                { label: 'New Patients Seen', value: 8, target: 10, color: 'bg-blue-500' },
                { label: 'Follow-ups Done', value: 16, target: 18, color: 'bg-purple-500' },
                { label: 'Hours Worked', value: 32, target: 35, color: 'bg-amber-500' },
              ].map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}/{item.target}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', item.color)}
                      style={{ width: `${(item.value / item.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Patient Demographics</CardTitle>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Age Groups</p>
                <div className="space-y-3">
                  {[
                    { label: '18-30', value: 22, percentage: 25, color: 'bg-blue-500' },
                    { label: '31-45', value: 31, percentage: 36, color: 'bg-green-500' },
                    { label: '46-60', value: 24, percentage: 28, color: 'bg-amber-500' },
                    { label: '60+', value: 10, percentage: 11, color: 'bg-purple-500' },
                  ].map((group, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-500 dark:text-gray-400">{group.label}</span>
                      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', group.color)}
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
                        {group.value} ({group.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Gender Distribution</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">58%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Female</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">42%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Male</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}