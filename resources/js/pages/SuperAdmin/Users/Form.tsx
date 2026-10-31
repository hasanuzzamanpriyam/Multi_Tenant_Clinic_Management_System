'use client';

import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, User, Mail, Lock, Phone, Stethoscope, Building2, Shield } from 'lucide-react';

interface Clinic {
    id: number;
    name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    tenant_id: number | null;
    phone: string | null;
    specialty: string | null;
    age: number | null;
    gender: string | null;
    is_active?: boolean;
}

export default function UserForm({
    user,
    clinics = [],
}: {
    user?: UserData;
    clinics?: Clinic[];
}) {
    const isEditing = !!user;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role || 'patient',
        tenant_id: user?.tenant_id ? String(user.tenant_id) : '',
        phone: user?.phone || '',
        specialty: user?.specialty || '',
        age: user?.age ? String(user.age) : '',
        gender: user?.gender || '',
        is_active: user?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.users.update', user!.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    return (
        <>
            <Head title={isEditing ? `Edit User: ${user?.name}` : 'Create New User'} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {isEditing ? 'Edit User Profile' : 'Register New User'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isEditing
                                ? `Update user role, credentials, and tenant assignment.`
                                : 'Create an administrative, medical, or patient account.'}
                        </p>
                    </div>

                    <Link href={route('admin.users.index')}>
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </Button>
                    </Link>
                </div>

                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-900 dark:text-white">Account Details</CardTitle>
                        <CardDescription>
                            Configure user credentials, role permissions, and clinic tenancy.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form id="user-form" onSubmit={submit} className="space-y-5">
                            {/* Full Name & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-semibold">
                                        Full Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="Dr. John Smith"
                                    />
                                    {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold">
                                        Email Address <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Role & Clinic Assignment */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="text-xs font-semibold">
                                        System Role <span className="text-rose-500">*</span>
                                    </Label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                                    >
                                        <option value="patient">Patient (Single Clinic)</option>
                                        <option value="doctor">Doctor (Single Clinic)</option>
                                        <option value="clinic_admin">Clinic Admin (Single Clinic)</option>
                                        <option value="super_admin">Super Admin (Cross-Tenant Root)</option>
                                    </select>
                                    {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tenant_id" className="text-xs font-semibold">
                                        Clinic Tenancy{' '}
                                        {data.role !== 'super_admin' && <span className="text-rose-500">*</span>}
                                    </Label>
                                    <select
                                        id="tenant_id"
                                        value={data.tenant_id}
                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                        disabled={data.role === 'super_admin'}
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0080FF] disabled:opacity-50"
                                    >
                                        <option value="">
                                            {data.role === 'super_admin'
                                                ? 'Global / Cross-Tenant (No Clinic)'
                                                : 'Select a clinic...'}
                                        </option>
                                        {clinics.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tenant_id && (
                                        <p className="text-xs text-rose-500 mt-1">{errors.tenant_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold">
                                        Password {isEditing ? '(Leave blank to retain current)' : <span className="text-rose-500">*</span>}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required={!isEditing}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                        Confirm Password {isEditing ? '' : <span className="text-rose-500">*</span>}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required={!isEditing}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Phone & Specialty */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="+880 1700 000000"
                                    />
                                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="specialty" className="text-xs font-semibold">
                                        Medical Specialty (for Doctors)
                                    </Label>
                                    <Input
                                        id="specialty"
                                        value={data.specialty}
                                        onChange={(e) => setData('specialty', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="e.g. Cardiologist, Pediatrician"
                                    />
                                    {errors.specialty && <p className="text-xs text-rose-500 mt-1">{errors.specialty}</p>}
                                </div>
                            </div>

                            {/* Age & Gender */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="age" className="text-xs font-semibold">
                                        Age
                                    </Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        className="rounded-xl"
                                        placeholder="35"
                                    />
                                    {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="gender" className="text-xs font-semibold">
                                        Gender
                                    </Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                                    >
                                        <option value="">Select gender...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender}</p>}
                                </div>
                            </div>

                            {/* Status (Edit only) */}
                            {isEditing && (
                                <div className="pt-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded text-[#0080FF] focus:ring-[#0080FF]"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Account is active and verified
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link href={route('admin.users.index')}>
                                    <Button type="button" variant="outline" className="rounded-xl cursor-pointer">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#0080FF] hover:bg-[#0066CC] text-white font-medium rounded-xl cursor-pointer"
                                >
                                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

