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
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const stats = [
    {
      name: 'Total Clinics',
      value: '24',
      change: '+12%',
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Active Users',
      value: '1,234',
      change: '+8%',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Pending Approvals',
      value: '18',
      change: '-5%',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      name: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const quickActions = [
    {
      name: 'Add New Clinic',
      description: 'Register a new clinic in the system',
      icon: Plus,
      href: '/admin/clinics/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Manage Users',
      description: 'View and manage all system users',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600',
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
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  const recentActivity = [
    { id: 1, action: 'New clinic registered', entity: 'City Medical Center', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'User role updated', entity: 'Dr. Sarah Johnson', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Appointment approved', entity: 'Booking #APT-2024-001', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'Clinic deactivated', entity: 'Old Town Clinic', time: '1 day ago', type: 'warning' },
  ];

  return (
    <>
      <Head title="Super Admin Dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Link href="/admin/clinics">
              <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold gap-1.5 shadow-xs">
                <Building2 className="h-4 w-4" />
                Manage Clinics
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
                    <p className={cn('text-sm mt-1', stat.change.startsWith('-') ? 'text-red-500' : 'text-green-500')}>
                      {stat.change} vs last month
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

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Quick Actions
                <Link href="/admin/clinics/create" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={cn(
                      'p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', action.color, 'group-hover:opacity-90')}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-3 font-medium text-gray-900 dark:text-white">{action.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={cn(
                      'p-2 rounded-full flex-shrink-0',
                      activity.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      activity.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.entity}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Resources</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">CPU Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">42%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Memory Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">68%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Storage</span>
                    <span className="font-medium text-gray-900 dark:text-white">3.2 TB / 10 TB</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Clinics by Appointments</CardTitle>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'City Medical Center', appointments: 342, growth: '+12%' },
                  { name: 'Metro Health Clinic', appointments: 287, growth: '+8%' },
                  { name: 'Family Care Center', appointments: 195, growth: '+5%' },
                ].map((clinic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300 dark:text-gray-600">{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{clinic.name}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{clinic.growth}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{clinic.appointments}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Growth</CardTitle>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'This Month', value: '+234', color: 'text-green-600 dark:text-green-400' },
                  { label: 'Last Month', value: '+189', color: 'text-green-600 dark:text-green-400' },
                  { label: 'This Quarter', value: '+1,247', color: 'text-green-600 dark:text-green-400' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className={cn('font-semibold', item.color)}>{item.value}</span>
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

// Helper for className concatenation
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}