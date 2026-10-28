'use client';

import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CheckCircle,
    X,
    UserPlus,
    Loader2,
    AlertCircle,
    CheckCircle2,
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
    const [rejectReason, setRejectReason] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true,
    });

    const dayOptions = dayNames.map((name, index) => ({ value: index, label: name }));

    const handleApprove = (doctorId: number) => {
        setApprovingId(doctorId);
        post(route('clinic-admin.approvals.approve', doctorId), {
            onSuccess: () => setApprovingId(null),
        });
    };

    const handleReject = (doctorId: number) => {
        if (!rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        setRejectingId(doctorId);
        post(route('clinic-admin.approvals.reject', doctorId), {
            data: { rejection_reason: rejectReason },
            onSuccess: () => {
                setRejectingId(null);
                setRejectReason('');
            },
        });
    };

    const confirmReject = (doctorId: number) => {
        setRejectingId(doctorId);
    };

    const cancelReject = () => {
        setRejectingId(null);
        setRejectReason('');
    };

    const hasOverlap = (day: number, start: string, end: string, excludeId?: number) => {
        return pendingDoctors.data.some(a =>
            a.id !== excludeId &&
            a.day_of_week === day &&
            a.is_available &&
            ((a.start_time < end && a.end_time > start))
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <>
            <Head title="Doctor Approvals" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Approvals</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Review and manage pending doctor registrations for your clinic
                        </p>
                    </div>
                </div>

                {/* Pending Doctors Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Pending Doctor Registrations
                            <Badge variant="secondary" className="ml-2">
                                {pendingDoctors.total} pending
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Review and approve or reject new doctor registrations for your clinic
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingDoctors.data.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No pending registrations</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    All doctor registrations have been reviewed.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-32">Doctor</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="w-40">Specialty</TableHead>
                                            <TableHead className="w-40">Registered</TableHead>
                                            <TableHead className="w-40">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingDoctors.data.map((doctor) => (
                                            <TableRow key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                                    {doctor.name}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {doctor.email}
                                                </TableCell>
                                                <TableCell>
                                                    {doctor.specialty ? (
                                                        <Badge variant="secondary">{doctor.specialty}</Badge>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 text-sm">Not specified</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {formatDate(doctor.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleApprove(doctor.id)}
                                                            disabled={processing}
                                                            className="w-24"
                                                        >
                                                            {approvingId === doctor.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => confirmReject(doctor.id)}
                                                            disabled={processing}
                                                            className="w-24"
                                                        >
                                                            {rejectingId === doctor.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                            ) : (
                                                                <>
                                                                    <X className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Rejection Reason Modal */}
                        {rejectingId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Reject Doctor Registration
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Please provide a reason for rejecting this doctor registration.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Rejection Reason
                                            </Label>
                                            <textarea
                                                id="rejection_reason"
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                rows={4}
                                                className={cn(
                                                    'mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400',
                                                    !rejectReason.trim() && 'border-red-500'
                                                )}
                                                placeholder="Enter rejection reason..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button variant="outline" onClick={cancelReject} disabled={processing}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleReject(rejectingId!)} disabled={processing}>
                                            {processing ? 'Rejecting...' : 'Reject'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}