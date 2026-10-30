'use client';

import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClinicProLogo } from '@/components/ClinicProLogo';
import {
    Calendar,
    Pill,
    Shield,
    Building2,
    Users,
    CheckCircle2,
    ArrowRight,
    Stethoscope,
    Lock,
    Clock,
    FileCheck,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

export default function Welcome() {
    const roles = [
        {
            title: 'Super Admin',
            role: 'Cross-Tenant Management',
            description: 'Full oversight over all clinics, tenants, system-wide governance, and global admin users.',
            icon: Shield,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            badge: 'Cross-Tenant',
        },
        {
            title: 'Clinic Admin',
            role: 'Practice Operations',
            description: 'Manage clinic doctors, verify doctor registrations, maintain patient profiles, and view clinic stats.',
            icon: Building2,
            color: 'text-[#0080FF] dark:text-[#38BDF8]',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            badge: 'Single-Tenant',
        },
        {
            title: 'Doctor',
            role: 'Clinical Care & Rx',
            description: 'Customize weekly availability slots, accept visits, record diagnosis, and issue digital prescriptions.',
            icon: Stethoscope,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            badge: 'Single-Tenant',
        },
        {
            title: 'Patient',
            role: 'Personal Health Portal',
            description: 'Book appointments with top specialists, track visit status, and view/print digital prescriptions.',
            icon: Users,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-950/40',
            badge: 'Single-Tenant',
        },
    ];

    const features = [
        {
            icon: Lock,
            title: 'Complete Tenant Isolation',
            description: 'Global Eloquent scopes ensure data from one clinic never leaks to another. Enterprise-grade isolation.',
        },
        {
            icon: Pill,
            title: 'Digital Prescription Engine',
            description: 'Complete appointment flow with integrated medication dosage, frequency, durations, and printable Rx.',
        },
        {
            icon: Clock,
            title: 'Smart Availability & Slots',
            description: 'Doctors set flexible recurring weekly shifts. Patients automatically book only available time windows.',
        },
        {
            icon: Shield,
            title: 'Two-Factor Authentication',
            description: 'Integrated Laravel Fortify 2FA, passkeys, and verified sessions to safeguard sensitive clinical records.',
        },
    ];

    return (
        <>
            <Head title="ClinicPro — Modern Multi-Tenant Healthcare Management" />

            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-[#0080FF] selection:text-white">
                {/* Navigation Bar */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <Link href="/">
                            <ClinicProLogo size="lg" />
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-semibold text-slate-700 dark:text-slate-200">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white shadow-sm font-semibold">
                                    Patient Portal <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                    {/* Subtle Brand Background Glows */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#0080FF]/15 via-[#16134D]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 text-[#0080FF] dark:text-[#38BDF8] text-xs font-bold tracking-wide">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Multi-Tenant Clinical OS & Practice Management</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                                The Intelligent Platform for{' '}
                                <span className="bg-gradient-to-r from-[#0080FF] via-[#0066CC] to-[#16134D] dark:from-[#38BDF8] dark:to-[#0080FF] bg-clip-text text-transparent">
                                    Modern Clinics
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                                Connect clinics, doctors, and patients in a unified multi-tenant environment.
                                Featuring strict data isolation, digital prescriptions, and intelligent doctor schedules.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                                <Link href="/login" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto bg-[#0080FF] hover:bg-[#0070E0] text-white shadow-md font-bold text-base h-12 px-8 rounded-xl">
                                        Access Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/register" className="w-full sm:w-auto">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold text-base h-12 px-8 rounded-xl border-slate-300 dark:border-slate-700">
                                        Register as Patient
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-[#0080FF]" /> 100% Tenant Scoped
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-[#0080FF]" /> Digital Prescriptions
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-[#0080FF]" /> HIPAA / 2FA Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Role-Based Portals */}
                <section className="py-16 bg-white dark:bg-[#111726]/60 border-y border-slate-200/70 dark:border-slate-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                Tailored Workflows for Every Healthcare Role
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Role-based access control with dedicated portals, capabilities, and tenant-aware scoping.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {roles.map((item) => (
                                <Card
                                    key={item.title}
                                    className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                                >
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {item.badge}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#0080FF] transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs font-semibold text-[#0080FF] dark:text-[#38BDF8] mt-0.5">
                                                {item.role}
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* System Capabilities Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="text-xs font-bold text-[#0080FF] uppercase tracking-wider">Enterprise Architecture</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                Engineered for Reliability & Clinical Precision
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feat) => (
                                <div
                                    key={feat.title}
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-4 shadow-xs"
                                >
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] shrink-0">
                                        <feat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {feat.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {feat.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111726]/80 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <ClinicProLogo size="sm" />
                            <span className="text-xs text-slate-400">
                                © {new Date().getFullYear()} ClinicPro. All rights reserved.
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <Link href="/login" className="hover:text-[#0080FF]">Sign In</Link>
                            <span>•</span>
                            <Link href="/register" className="hover:text-[#0080FF]">Patient Registration</Link>
                            <span>•</span>
                            <span className="text-slate-400">Laravel 13 • React • Inertia</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
