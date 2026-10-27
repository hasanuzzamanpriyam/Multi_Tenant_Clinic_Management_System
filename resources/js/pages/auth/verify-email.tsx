'use client';

import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmail() {
    const { post, processing } = useForm({});

    const resend = () => {
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                            Verify Your Email Address
                        </h1>
                    </div>

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-center">Email Verification</CardTitle>
                            <CardDescription className="text-center">
                                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Didn't receive the email?
                            </p>
                            <Button variant="outline" className="w-full" onClick={resend} disabled={processing}>
                                {processing ? 'Sending...' : 'Resend Verification Email'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}