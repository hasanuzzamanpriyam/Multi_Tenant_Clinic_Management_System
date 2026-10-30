'use client';

import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CheckCircle2,
    X,
    UserCheck,
    Loader2,
    AlertCircle,
    Stethoscope,
    Mail,
    Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    specialty: string | null;
    age: number | null;
    gender: string | null;
    created_at: string;
}

interface PendingDoctors {
    data: Doctor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function ApprovalsIndex({ pendingDoctors }: { pendingDoctors: PendingDoctors }) {
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const { post, processing } = useForm();

    const handleApprove = (doctorId: number) => {
        setApprovingId(doctorId);
        post(route('clinic-admin.approvals.approve', doctorId), {
            onFinish: () => setApprovingId(null),
        });
    };

    const handleReject = (doctorId: number) => {
        setRejectingId(doctorId);
        post(route('clinic-admin.approvals.reject', doctorId), {
            onFinish: () => setRejectingId(null),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title="Doctor Approvals — ClinicPro" />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Doctor Registration Approvals
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Verify and activate pending doctor applications for your clinic
                        </p>
                    </div>

                    <Badge variant="outline" className="border-blue-200 text-[#0080FF] self-start sm:self-auto px-3 py-1 text-xs">
                        {pendingDoctors.total} Pending Review
                    </Badge>
                </div>

                {/* Pending Doctors Table Card */}
                <Card className="border border-slate-200/90 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-base font-bold">Pending Applications</CardTitle>
                        <CardDescription className="text-xs">
                            Approved doctors will immediately gain access to their consultation dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {pendingDoctors.data.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-3">
                                    <UserCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    All clear! No pending doctor approvals
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                    When new healthcare specialists register under your clinic, their credentials will show up here for review.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <TableHead className="text-xs font-bold">Doctor</TableHead>
                                            <TableHead className="text-xs font-bold">Contact</TableHead>
                                            <TableHead className="text-xs font-bold">Specialty</TableHead>
                                            <TableHead className="text-xs font-bold">Registered</TableHead>
                                            <TableHead className="text-xs font-bold text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingDoctors.data.map((doctor) => (
                                            <TableRow key={doctor.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center shrink-0 font-bold text-xs">
                                                            <Stethoscope className="h-4.5 w-4.5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {doctor.name}
                                                            </p>
                                                            {(doctor.gender || doctor.age) && (
                                                                <p className="text-[11px] text-slate-400">
                                                                    {doctor.gender && `${doctor.gender}`}
                                                                    {doctor.gender && doctor.age && ', '}
                                                                    {doctor.age && `${doctor.age} yrs`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                                    <div className="space-y-0.5">
                                                        <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {doctor.email}</p>
                                                        {doctor.phone && (
                                                            <p className="flex items-center gap-1.5 text-slate-400"><Phone className="h-3 w-3 text-slate-400" /> {doctor.phone}</p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0080FF] border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                                                        {doctor.specialty || 'General Practice'}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-xs text-slate-500">
                                                    {formatDate(doctor.created_at)}
                                                </TableCell>

                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(doctor.id)}
                                                            disabled={processing}
                                                            className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold text-xs h-8 px-3"
                                                        >
                                                            {approvingId === doctor.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                            ) : (
                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                            )}
                                                            Approve
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReject(doctor.id)}
                                                            disabled={processing}
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8 px-3"
                                                        >
                                                            {rejectingId === doctor.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                            ) : (
                                                                <X className="h-3.5 w-3.5 mr-1" />
                                                            )}
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
