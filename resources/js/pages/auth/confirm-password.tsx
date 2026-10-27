'use client';

import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <>
            <Head title="Confirm Password" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Confirm Password
                        </h1>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                            Please confirm your password to continue
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center">Confirm Password</CardTitle>
                            <CardDescription className="text-center">
                                Enter your password to confirm your identity
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
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

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Confirming...' : 'Confirm'}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <Link href={route('dashboard')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Cancel
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}