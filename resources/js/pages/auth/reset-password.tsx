'use client';

import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ResetPasswordProps {
    email: string;
    token: string;
}

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email,
        password: '',
        password_confirmation: '',
        token,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Reset your password
                        </h1>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center">Reset Password</CardTitle>
                            <CardDescription className="text-center">
                                Enter your new password below
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <input type="hidden" name="token" value={token} />
                                
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={data.email}
                                        readOnly
                                        className="bg-gray-50 dark:bg-gray-800"
                                    />
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
                                    {processing ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <Link href={route('login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Back to login
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}