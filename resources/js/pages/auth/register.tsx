'use client';

import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicProLogo } from '@/components/ClinicProLogo';
import { ArrowRight, Lock, Mail, Phone, User, Calendar } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        age: '',
        gender: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Create Patient Account — ClinicPro" />

            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#0080FF] selection:text-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
                    <Link href="/" className="inline-block">
                        <ClinicProLogo size="lg" />
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Create Your Patient Account
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Join ClinicPro to book doctor appointments and manage medical records
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="border border-slate-200/90 dark:border-slate-800 shadow-lg">
                        <CardHeader className="space-y-1 pb-3">
                            <CardTitle className="text-lg font-bold">Patient Registration</CardTitle>
                            <CardDescription className="text-xs">
                                Enter your personal details to get started
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`pl-9 ${errors.name ? 'border-rose-500' : 'focus-visible:ring-[#0080FF]'}`}
                                            placeholder="Jane Doe"
                                            disabled={processing}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`pl-9 ${errors.email ? 'border-rose-500' : 'focus-visible:ring-[#0080FF]'}`}
                                            placeholder="jane@example.com"
                                            disabled={processing}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Phone (Optional)
                                        </Label>
                                        <div className="relative">
                                            <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="pl-9 focus-visible:ring-[#0080FF]"
                                                placeholder="+1 555-0123"
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="age" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Age (Optional)
                                        </Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            min="0"
                                            max="130"
                                            value={data.age}
                                            onChange={(e) => setData('age', e.target.value)}
                                            className="focus-visible:ring-[#0080FF]"
                                            placeholder="28"
                                            disabled={processing}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                required
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`pl-9 ${errors.password ? 'border-rose-500' : 'focus-visible:ring-[#0080FF]'}`}
                                                placeholder="••••••••"
                                                disabled={processing}
                                            />
                                        </div>
                                        {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                required
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="pl-9 focus-visible:ring-[#0080FF]"
                                                placeholder="••••••••"
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold h-10.5 rounded-xl text-sm shadow-sm mt-2"
                                    disabled={processing}
                                >
                                    {processing ? 'Creating Account...' : 'Complete Registration'}
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </form>

                            <div className="mt-5 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-bold text-[#0080FF] hover:text-[#0070E0] dark:text-[#38BDF8]"
                                    >
                                        Sign in
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
