'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CalendarDays,
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    Stethoscope,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
    specialty?: string | null;
}

interface Patient {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
}

interface AppointmentItem {
    id: number;
    appointment_date: string;
    appointment_time: string | null;
    status: string;
    patient_notes?: string | null;
    doctor_notes?: string | null;
    patient?: Patient | null;
    doctor?: Doctor | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAppointments {
    data: AppointmentItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

export default function AppointmentsIndex({
    appointments,
    doctors = [],
    filters,
}: {
    appointments: PaginatedAppointments;
    doctors?: Doctor[];
    filters?: { status?: string; doctor_id?: string; search?: string };
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [doctorId, setDoctorId] = useState(filters?.doctor_id || '');

    const applyFilters = (newStatus: string, newDoctor: string, newSearch: string) => {
        router.get(
            route('clinic-admin.appointments.index'),
            {
                status: newStatus || undefined,
                doctor_id: newDoctor || undefined,
                search: newSearch || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(status, doctorId, search);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        applyFilters(newStatus, doctorId, search);
    };

    const handleDoctorChange = (newDoctor: string) => {
        setDoctorId(newDoctor);
        applyFilters(status, newDoctor, search);
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setDoctorId('');
        router.get(route('clinic-admin.appointments.index'), {}, { preserveState: true });
    };

    const getStatusBadge = (aptStatus: string) => {
        switch (aptStatus) {
            case 'approved':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-[11px] font-semibold gap-1 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-[11px] font-semibold gap-1 py-0.5">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-[#0080FF] border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 text-[11px] font-semibold gap-1 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-[11px] font-semibold gap-1 py-0.5">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="capitalize text-[11px] font-semibold py-0.5">
                        {aptStatus}
                    </Badge>
                );
        }
    };

    const statusPills = [
        { key: '', label: 'All Appointments' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <>
            <Head title="Clinic Appointments - Clinic Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard" className="text-slate-400 hover:text-[#0080FF] transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Clinic Appointments
                            </h1>
                            <Badge className="bg-[#0080FF] text-white ml-2 text-xs">
                                {appointments.total} Total
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Comprehensive schedule of patient consultations and doctor assignments across your clinic.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="rounded-xl text-xs gap-1.5 cursor-pointer"
                    >
                        <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                        Reset Filters
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {statusPills.map((pill) => (
                                <button
                                    key={pill.key}
                                    type="button"
                                    onClick={() => handleStatusChange(pill.key)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                        status === pill.key
                                            ? 'bg-[#0080FF] text-white border-[#0080FF] shadow-xs'
                                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0080FF]/60'
                                    )}
                                >
                                    {pill.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="flex-1 relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search by patient or doctor name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 text-xs rounded-xl"
                                />
                            </form>

                            <select
                                value={doctorId}
                                onChange={(e) => handleDoctorChange(e.target.value)}
                                className="rounded-xl h-10 text-xs border border-slate-200 dark:border-slate-800 bg-background px-3 min-w-[200px]"
                            >
                                <option value="">Filter by Doctor</option>
                                {doctors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        Dr. {d.name.replace(/^dr\.?\s+/i, '')} ({d.specialty || 'General'})
                                    </option>
                                ))}
                            </select>

                            <Button onClick={handleSearch} className="h-10 px-5 rounded-xl bg-[#0080FF] hover:bg-[#0070E0] text-white text-xs font-semibold cursor-pointer">
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[#0080FF]" />
                                    Consultation Schedule
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Showing clinic bookings sorted by appointment date
                                </CardDescription>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                Page {appointments.current_page} of {appointments.last_page || 1}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {appointments.data.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-3">
                                    <CalendarDays className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No appointments found</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                    No consultations match the selected filters.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200/80 dark:border-slate-800">
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Patient</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Doctor</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Date & Time</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Status</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Notes / Reason</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.data.map((apt) => (
                                            <TableRow key={apt.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800 transition-colors">
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                            {apt.patient?.name ? apt.patient.name[0] : 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                {apt.patient?.name || 'Unknown Patient'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">{apt.patient?.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <Stethoscope className="h-3.5 w-3.5 text-[#0080FF] flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                {apt.doctor ? `Dr. ${apt.doctor.name.replace(/^dr\.?\s+/i, '')}` : 'Not Assigned'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">{apt.doctor?.specialty || 'General'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5 whitespace-nowrap">
                                                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                                                        <div className="flex items-center gap-1.5 font-medium">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            <span>{apt.appointment_date ? apt.appointment_date.split('T')[0] : 'N/A'}</span>
                                                        </div>
                                                        {apt.appointment_time && (
                                                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                                                                <Clock className="h-3 w-3 text-slate-400" />
                                                                <span>{apt.appointment_time}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    {getStatusBadge(apt.status)}
                                                </TableCell>

                                                <TableCell className="py-3.5 max-w-[260px]">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {apt.patient_notes || apt.doctor_notes || 'Routine consultation'}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {appointments.links && appointments.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                <span className="text-xs text-slate-500">
                                    Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{appointments.data.length}</span> of{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{appointments.total}</span> appointments
                                </span>
                                <div className="flex items-center gap-1">
                                    {appointments.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={cn(
                                                'px-3 py-1.5 text-xs rounded-lg transition-colors',
                                                link.active
                                                    ? 'bg-[#0080FF] text-white font-bold'
                                                    : link.url
                                                    ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
