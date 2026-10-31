'use client';

import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Stethoscope, Save, Loader2 } from 'lucide-react';

interface DoctorData {
    id?: number;
    name: string;
    email: string;
    phone?: string | null;
    specialty?: string | null;
    age?: number | string | null;
    gender?: string | null;
    is_active?: boolean;
}

export default function DoctorForm({ doctor }: { doctor?: DoctorData }) {
    const isEdit = !!doctor;

    const { data, setData, post, put, processing, errors } = useForm({
        name: doctor?.name || '',
        email: doctor?.email || '',
        phone: doctor?.phone || '',
        specialty: doctor?.specialty || '',
        age: doctor?.age || '',
        gender: doctor?.gender || '',
        is_active: doctor?.is_active ?? true,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('clinic-admin.doctors.update', doctor.id));
        } else {
            post(route('clinic-admin.doctors.store'));
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit Dr. ${doctor.name}` : 'Add New Doctor'} />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('clinic-admin.doctors.index')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {isEdit ? `Edit Dr. ${doctor.name}` : 'Add New Doctor'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isEdit
                                ? 'Update doctor credentials, specialty, and contact details'
                                : 'Register a new healthcare practitioner to your clinic roster'}
                        </p>
                    </div>
                </div>

                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-[#0080FF]" />
                            Doctor Profile Details
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Fields marked with an asterisk are required
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="name" className="text-xs font-semibold">Doctor Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Sarah Johnson, MD"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="doctor@clinic.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+1 (555) 000-0000"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                    />
                                    {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="specialty" className="text-xs font-semibold">Medical Specialty</Label>
                                    <Input
                                        id="specialty"
                                        placeholder="e.g. Cardiology, Pediatrics"
                                        value={data.specialty}
                                        onChange={(e) => setData('specialty', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                    />
                                    {errors.specialty && <p className="text-xs text-rose-500">{errors.specialty}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="gender" className="text-xs font-semibold">Gender</Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="w-full rounded-xl h-10 text-sm border border-slate-200 dark:border-slate-800 bg-background px-3"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-xs text-rose-500">{errors.gender}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold">
                                        {isEdit ? 'Password (Leave blank to keep unchanged)' : 'Account Password *'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                        required={!isEdit}
                                    />
                                    {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                        Confirm Password {isEdit ? '' : '*'}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="rounded-xl h-10 text-sm"
                                        required={!isEdit}
                                    />
                                </div>
                            </div>

                            {isEdit && (
                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-[#0080FF] focus:ring-[#0080FF]"
                                        />
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Account is active and permitted to accept appointments
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link href={route('clinic-admin.doctors.index')}>
                                    <Button type="button" variant="outline" className="rounded-xl text-xs cursor-pointer">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                                >
                                    {processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isEdit ? 'Save Changes' : 'Create Doctor'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

