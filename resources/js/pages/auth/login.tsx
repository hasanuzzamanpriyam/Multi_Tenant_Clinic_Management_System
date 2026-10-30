'use client';

import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicProLogo } from '@/components/ClinicProLogo';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Sign In — ClinicPro" />

            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#0080FF] selection:text-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
                    <Link href="/" className="inline-block">
                        <ClinicProLogo size="lg" />
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Sign In to ClinicPro
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Multi-tenant clinical management and healthcare portal
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="border border-slate-200/90 dark:border-slate-800 shadow-lg">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-lg font-bold">Welcome back</CardTitle>
                            <CardDescription className="text-xs">
                                Enter your credentials to access your clinic portal
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-4.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`pl-9 ${errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : 'focus-visible:ring-[#0080FF]'}`}
                                            disabled={processing}
                                            placeholder="doctor@clinic.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-rose-500 dark:text-rose-400">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Password
                                        </Label>
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-medium text-[#0080FF] hover:text-[#0070E0] dark:text-[#38BDF8]"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`pl-9 ${errors.password ? 'border-rose-500 focus-visible:ring-rose-500' : 'focus-visible:ring-[#0080FF]'}`}
                                            disabled={processing}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-rose-500 dark:text-rose-400">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-[#0080FF] focus:ring-[#0080FF] border-slate-300 rounded"
                                    />
                                    <Label htmlFor="remember" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                                        Remember my session
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold h-10.5 rounded-xl text-sm shadow-sm"
                                    disabled={processing}
                                >
                                    {processing ? 'Signing In...' : 'Sign In'}
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </form>

                            <div className="mt-5 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    New patient?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-bold text-[#0080FF] hover:text-[#0070E0] dark:text-[#38BDF8]"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
