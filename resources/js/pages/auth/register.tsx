'use client';

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Create your account
                        </h1>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href={route('login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center">Register</CardTitle>
                            <CardDescription className="text-center">
                                Enter your details to create a new account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        disabled={processing}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        disabled={processing}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        disabled={processing}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        disabled={processing}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500 dark:text-red-400">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Registering...' : 'Register'}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}