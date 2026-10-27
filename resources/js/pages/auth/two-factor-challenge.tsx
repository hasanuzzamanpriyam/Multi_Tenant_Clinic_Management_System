'use client';

import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: false,
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('two-factor.login'));
    };

    return (
        <>
            <Head title="Two Factor Authentication" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Two Factor Authentication
                        </h1>
                        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                            Enter the authentication code from your authenticator app
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center">2FA Challenge</CardTitle>
                            <CardDescription className="text-center">
                                Enter the 6-digit code from your authenticator app
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Authentication Code</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        autoComplete="one-time-code"
                                        required
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className={errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                        disabled={processing}
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500 dark:text-red-400">{errors.code}</p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <Label htmlFor="remember" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                        Remember this device for 30 days
                                    </Label>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Verifying...' : 'Verify'}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                                    Don't have access to your authenticator app?
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setData('recovery_code', true)}
                                >
                                    Use Recovery Code
                                </Button>
                            </div>
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