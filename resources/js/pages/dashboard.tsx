'use client';

import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Dashboard({ auth }: DashboardProps) {
    const { post, processing } = useForm({});

    const logout = () => {
        post(route('logout'));
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Welcome back, {auth.user.name}!
                            </p>
                        </div>
                        <Button variant="outline" onClick={logout} disabled={processing}>
                            {processing ? 'Logging out...' : 'Log out'}
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Manage your account settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    <strong>Name:</strong> {auth.user.name}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    <strong>Email:</strong> {auth.user.email}
                                </p>
                                <Link href="/profile" className="mt-4 inline-block">
                                    <Button variant="outline" size="sm">
                                        View Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>Secure your account with 2FA</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Add an extra layer of security to your account by enabling two-factor authentication.
                                </p>
                                <Link href="/two-factor-authentication" className="inline-block">
                                    <Button variant="outline" size="sm">
                                        Manage 2FA
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sessions</CardTitle>
                                <CardDescription>Manage your active sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    View and manage your active sessions across devices.
                                </p>
                                <Link href="/user/sessions" className="inline-block">
                                    <Button variant="outline" size="sm">
                                        Manage Sessions
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}