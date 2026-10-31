'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Users,
    Clock,
    ArrowLeft,
    Edit2,
    Trash2,
    Shield,
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle,
    UserCheck,
    User,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

interface AppointmentItem {
    id: number;
    appointment_date: string;
    appointment_time: string | null;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
    patient?: { id: number; name: string; email: string };
    doctor?: { id: number; name: string; email: string };
    created_at: string;
}

interface ClinicDetails {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    users_count?: number;
    appointments_count?: number;
    created_at: string;
    users?: UserItem[];
    appointments?: AppointmentItem[];
}

export default function ClinicShow({ clinic }: { clinic: ClinicDetails }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'appointments'>('overview');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${clinic.name}"? This action cannot be undone.`)) {
            setIsDeleting(true);
            router.delete(route('admin.clinics.destroy', clinic.id), {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeStr?: string | null) => {
        if (!timeStr) return '';
        try {
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                const hour = parseInt(parts[0], 10);
                const min = parts[1];
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                return `${formattedHour}:${min} ${ampm}`;
            }
            return timeStr;
        } catch {
            return timeStr;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200">Super Admin</Badge>;
            case 'clinic_admin':
                return <Badge className="bg-[#0080FF]/10 text-[#0080FF] border-[#0080FF]/30">Clinic Admin</Badge>;
            case 'doctor':
                return <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200">Doctor</Badge>;
            case 'patient':
                return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200">Patient</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </span>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const usersList = clinic.users || [];
    const appointmentsList = clinic.appointments || [];
    const doctorsCount = usersList.filter((u) => u.role === 'doctor').length;
    const patientsCount = usersList.filter((u) => u.role === 'patient').length;

    return (
        <>
            <Head title={`${clinic.name} - Clinic Details`} />

            <div className="space-y-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('admin.clinics.index')}>
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl cursor-pointer">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {clinic.name}
                                </h1>
                                <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 text-xs">
                                    Active Tenant
                                </Badge>
                                <span className="text-xs font-mono text-slate-400">ID #{clinic.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Registered on {formatDate(clinic.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.clinics.edit', clinic.id)}>
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer rounded-xl">
                                <Edit2 className="h-4 w-4" />
                                Edit Clinic
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-800 cursor-pointer rounded-xl"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Users</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {clinic.users_count ?? usersList.length}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {doctorsCount} Doctors · {patientsCount} Patients
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-[#0080FF]/10 text-[#0080FF] flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Appointments</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {clinic.appointments_count ?? appointmentsList.length}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Across all clinic doctors</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Activity className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Isolation Mode</p>
                                <p className="text-base font-bold text-[#16134D] dark:text-white mt-1">
                                    Tenant Scoped
                                </p>
                                <p className="text-xs text-slate-400 mt-1">BelongsToTenant Active</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                <Shield className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Member Since</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                                    {formatDate(clinic.created_at)}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Verified Organization</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                            activeTab === 'overview'
                                ? 'text-[#0080FF] border-b-2 border-[#0080FF]'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        )}
                    >
                        Overview & Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                            activeTab === 'users'
                                ? 'text-[#0080FF] border-b-2 border-[#0080FF]'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        )}
                    >
                        Members & Staff ({usersList.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('appointments')}
                        className={cn(
                            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                            activeTab === 'appointments'
                                ? 'text-[#0080FF] border-b-2 border-[#0080FF]'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        )}
                    >
                        Recent Appointments ({appointmentsList.length})
                    </button>
                </div>

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Building2 className="h-4 w-4 text-[#0080FF]" />
                                    Clinic Contact & Location Information
                                </CardTitle>
                                <CardDescription>Official registered particulars for this facility.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-[#0080FF]" />
                                            Email Address
                                        </p>
                                        <a
                                            href={`mailto:${clinic.email}`}
                                            className="text-sm font-semibold text-[#0080FF] hover:underline mt-1 block truncate"
                                        >
                                            {clinic.email}
                                        </a>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-emerald-500" />
                                            Phone Number
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                            {clinic.phone || 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                        Physical Address
                                    </p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-line">
                                        {clinic.address || 'No physical address provided.'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0080FF]/5 to-[#16134D]/5 border border-[#0080FF]/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-[#0080FF]/10 text-[#0080FF] flex items-center justify-center shrink-0">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                Database Tenant ID: {clinic.id}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                All patient records, doctor slots, and clinical workflows are isolated strictly to this tenant.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Summary / Status */}
                        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-base text-slate-900 dark:text-white">Facility Snapshot</CardTitle>
                                <CardDescription>Operational status overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3.5 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Tenant Status</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Operational</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Associated Doctors</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{doctorsCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Registered Patients</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{patientsCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Booking Pipeline</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {appointmentsList.filter((a) => a.status === 'confirmed').length} Active
                                    </span>
                                </div>

                                <div className="pt-2">
                                    <Link href={route('admin.clinics.edit', clinic.id)} className="w-full">
                                        <Button className="w-full bg-[#0080FF] hover:bg-[#0066CC] text-white rounded-xl cursor-pointer">
                                            Edit Clinic Details
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tab: Users */}
                {activeTab === 'users' && (
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base text-slate-900 dark:text-white">
                                    Clinic Members & Medical Personnel
                                </CardTitle>
                                <CardDescription>Personnel and patients scoped to {clinic.name}</CardDescription>
                            </div>
                            <Badge variant="outline">{usersList.length} total</Badge>
                        </CardHeader>
                        <CardContent>
                            {usersList.length === 0 ? (
                                <div className="text-center py-10">
                                    <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        No users registered under this clinic yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usersList.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 rounded-full bg-[#0080FF]/10 text-[#0080FF] font-semibold flex items-center justify-center text-xs">
                                                                {u.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                    {u.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                                        {u.phone || '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.is_active ? (
                                                            <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 text-[11px]">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-[11px]">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-400">
                                                        {formatDate(u.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Appointments */}
                {activeTab === 'appointments' && (
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base text-slate-900 dark:text-white">
                                    Recent Clinic Appointments
                                </CardTitle>
                                <CardDescription>Last {appointmentsList.length} bookings logged under this clinic</CardDescription>
                            </div>
                            <Badge variant="outline">{appointmentsList.length} total</Badge>
                        </CardHeader>
                        <CardContent>
                            {appointmentsList.length === 0 ? (
                                <div className="text-center py-10">
                                    <Calendar className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        No appointments booked for this clinic yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Doctor</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {appointmentsList.map((apt) => (
                                                <TableRow key={apt.id}>
                                                    <TableCell>
                                                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                                                            {formatDate(apt.appointment_date)}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(apt.appointment_time) || 'Standard Slot'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                            {apt.patient?.name || 'Walk-in / Unknown'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">{apt.patient?.email}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                            {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : 'Unassigned'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">{apt.doctor?.email}</p>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                                    <TableCell className="text-xs text-slate-400">
                                                        {formatDate(apt.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

