'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DefaultDashboard() {
  const { auth } = usePage().props as {
    auth: {
      user: {
        name: string;
        email: string;
        role: string;
      };
    };
  };

  return (
    <>
      <Head title="Dashboard" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {auth.user.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your account settings and preferences.</p>
              <Link href="/profile">
                <Button variant="outline">View Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Configure two-factor authentication and security settings.</p>
              <Link href="/two-factor-authentication">
                <Button variant="outline">Security Settings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">View and manage your active sessions across devices.</p>
              <Link href="/user/sessions">
                <Button variant="outline">Manage Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}