'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    Building2,
    User,
    Stethoscope,
    AlertCircle,
    Loader2,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Patient {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
}

interface Doctor {
    id: number;
    name: string;
    email: string;
    specialty?: string | null;
}

interface Clinic {
    id: number;
    name: string;
}

interface Appointment {
    id: number;
    tenant_id: number;
    appointment_date: string;
    appointment_time: string | null;
    status: string;
    patient_notes?: string | null;
    doctor_notes?: string | null;
    created_at: string;
    patient?: Patient | null;
    doctor?: Doctor | null;
    clinic?: Clinic | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAppointments {
    data: Appointment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

export default function ApprovalsIndex({
    appointments,
    filters,
    clinics = [],
}: {
    appointments: PaginatedAppointments;
    filters?: { tenant_id?: string };
    clinics?: Clinic[];
}) {
    const [selectedTenant, setSelectedTenant] = useState(filters?.tenant_id || '');
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectModalItem, setRejectModalItem] = useState<Appointment | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleFilterChange = (tenantId: string) => {
        setSelectedTenant(tenantId);
        router.get(
            route('admin.approvals.index'),
            { tenant_id: tenantId || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleApprove = (appointment: Appointment) => {
        if (confirm(`Approve appointment for ${appointment.patient?.name || 'patient'} with ${appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'doctor'}?`)) {
            setApprovingId(appointment.id);
            router.post(
                route('admin.approvals.approve', appointment.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setApprovingId(null),
                }
            );
        }
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectModalItem) return;

        setRejectingId(rejectModalItem.id);
        router.post(
            route('admin.approvals.reject', rejectModalItem.id),
            { rejection_reason: rejectReason || 'Declined by system administrator.' },
            {
                preserveScroll: true,
                onFinish: () => {
                    setRejectingId(null);
                    setRejectModalItem(null);
                    setRejectReason('');
                },
            }
        );
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
        if (!timeStr) return 'Standard Slot';
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

    return (
        <>
            <Head title="Pending Approvals - Super Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Appointment Approvals
                            </h1>
                            <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200">
                                {appointments.total} Pending
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Review and authorize pending clinical appointments across all clinics.
                        </p>
                    </div>

                    {/* Filter by Clinic */}
                    {clinics.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <select
                                value={selectedTenant}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                            >
                                <option value="">All Clinics</option>
                                {clinics.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Table */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-[#0080FF]" />
                                Pending Queue
                            </CardTitle>
                            <CardDescription>
                                Authorize bookings or provide reason if rejection is required.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length === 0 ? (
                            <div className="text-center py-14">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 opacity-80" />
                                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                                    All clear! No pending approvals.
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                    There are currently no clinical appointments awaiting verification across the selected scope.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Clinic</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.data.map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-lg bg-[#0080FF]/10 text-[#0080FF] flex items-center justify-center shrink-0">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                                            {apt.clinic?.name || `Clinic #${apt.tenant_id}`}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                                        {formatDate(apt.appointment_date)}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(apt.appointment_time)}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                        {apt.patient?.name || 'Walk-in'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">{apt.patient?.email}</p>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                        {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : 'Unassigned'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {apt.doctor?.specialty || 'General Practitioner'}
                                                    </p>
                                                </TableCell>

                                                <TableCell className="max-w-xs">
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                        {apt.patient_notes || 'No symptoms or notes recorded'}
                                                    </p>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(apt)}
                                                            disabled={approvingId === apt.id || rejectingId === apt.id}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                                                        >
                                                            {approvingId === apt.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            )}
                                                            Approve
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setRejectModalItem(apt);
                                                                setRejectReason('');
                                                            }}
                                                            disabled={approvingId === apt.id || rejectingId === apt.id}
                                                            className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 cursor-pointer"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {appointments.links && appointments.links.length > 3 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                                <div className="text-xs text-slate-500">
                                    Showing {(appointments.current_page - 1) * appointments.per_page + 1} to{' '}
                                    {Math.min(appointments.current_page * appointments.per_page, appointments.total)} of{' '}
                                    {appointments.total} appointments
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {appointments.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={cn(
                                                'px-3 py-1.5 text-xs rounded-lg transition-colors font-medium',
                                                !link.url && 'opacity-40 pointer-events-none text-slate-400',
                                                link.active
                                                    ? 'bg-[#0080FF] text-white shadow-xs'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

            {/* Rejection Modal */}
            {rejectModalItem && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Reject Appointment #{rejectModalItem.id}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Provide a reason for cancelling this booking.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g., Doctor is unavailable at the requested time slot."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRejectModalItem(null)}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={rejectingId !== null}
                                    className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                                >
                                    {rejectingId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                    Confirm Rejection
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

