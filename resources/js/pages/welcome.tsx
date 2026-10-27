'use client';

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome to Clinic Management
                        </h1>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                            Multi-tenant clinic management system built with Laravel, React, Inertia.js & Tailwind CSS
                        </p>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Getting Started</CardTitle>
                            <CardDescription className="text-center">
                                Choose an option below to continue
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/login">
                                <Button className="w-full" variant="default">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="w-full" variant="outline">
                                    Register
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>Built with:</p>
                        <div className="flex justify-center gap-4 mt-2 flex-wrap">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Laravel 13</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">React 18</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">TypeScript</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Inertia.js</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Tailwind CSS v4</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">shadcn/ui</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}