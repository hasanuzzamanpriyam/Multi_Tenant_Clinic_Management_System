'use client';

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Loader2, Filter, FileText, Pill, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prescription {
    id: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    special_instructions: string | null;
}

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
    patient_notes: string | null;
    doctor_notes: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    doctor: Doctor;
    prescriptions?: Prescription[];
}

interface AppointmentsData {
    data: Appointment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const statusColors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function PatientAppointments({ appointments, filters }: { appointments: AppointmentsData; filters: { status: string } }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [expandedPrescriptions, setExpandedPrescriptions] = useState<Record<number, boolean>>({});

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        window.location.href = route('patient.appointments.index') + '?' + params.toString();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    const getStatusClass = (status: string) => {
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const togglePrescriptions = (appointmentId: number) => {
        setExpandedPrescriptions(prev => ({
            ...prev,
            [appointmentId]: !prev[appointmentId],
        }));
    };

    return (
        <>
            <Head title="My Appointments" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your appointment history</p>
                    </div>
                    <Link href={route('patient.appointments.create')}>
                        <Button>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Book Appointment
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 max-w-xs">
                                <Label htmlFor="status" className="sr-only">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter} name="status">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V3z" />
                                </svg>
                                Filter
                            </Button>
                            <Link href={route('patient.appointments.index')}>
                                <Button variant="outline">Clear</Button>
                            </Link>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                My Appointments
                            </div>
                            <Badge variant="secondary">{appointments.total} total</Badge>
                        </CardTitle>
                        <CardDescription>View your upcoming and past appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No appointments found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {statusFilter ? 'Try adjusting your filters to see more appointments.' : 'You have no appointments scheduled yet. Book your first appointment now!'}
                                </p>
                                <Link href={route('patient.appointments.create')} className="mt-4 inline-block">
                                    <Button>
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Book Your First Appointment
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.data.map((appointment) => (
                                    <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                        <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.doctor.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.doctor.specialty || 'General Practice'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(appointment.appointment_date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900 dark:text-white">{formatTime(appointment.appointment_time)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className={cn(
                                                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                                                            appointment.status === 'approved' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                                                            appointment.status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                                                            appointment.status === 'cancelled' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                                                        )}>
                                                            {statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Doctor Notes for Completed Appointments */}
                                                {appointment.status === 'completed' && appointment.doctor_notes && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-start gap-3">
                                                            <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2V3a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2h-2" />
                                                            </svg>
                                                            <div>
                                                                <h4 className="font-medium text-green-800 dark:text-green-200">Doctor's Notes</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{appointment.doctor_notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Prescriptions for Completed Appointments */}
                                                {appointment.status === 'completed' && appointment.prescriptions && appointment.prescriptions.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                <h4 className="font-medium text-purple-800 dark:text-purple-200">Prescriptions</h4>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => togglePrescriptions(appointment.id)}
                                                                className="text-sm"
                                                            >
                                                                {expandedPrescriptions[appointment.id] ? (
                                                                    <>
                                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                                        Hide
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                                        View ({appointment.prescriptions.length})
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                        {expandedPrescriptions[appointment.id] && (
                                                            <div className="mt-4 space-y-3">
                                                                {appointment.prescriptions.map((prescription, index) => (
                                                                    <div key={prescription.id || index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                                                <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-gray-900 dark:text-white truncate">{prescription.medicine_name}</p>
                                                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                                    <span className="flex items-center gap-1">
                                                                                        <span className="font-medium">Dosage:</span> {prescription.dosage}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <span className="font-medium">Frequency:</span> {prescription.frequency}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <span className="font-medium">Duration:</span> {prescription.duration}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {prescription.special_instructions && (
                                                                            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                                                                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                                                                    <span className="font-medium">Special Instructions:</span> {prescription.special_instructions}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Patient Notes */}
                                                {appointment.patient_notes && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-start gap-3">
                                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h.01M17 10h.01" />
                                                            </svg>
                                                            <div>
                                                                <h4 className="font-medium text-blue-800 dark:text-blue-200">Your Notes</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.patient_notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status-specific info */}
                                                {appointment.status === 'pending' && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">Pending approval</span>
                                                            <span className="text-sm text-amber-500">Your appointment request is awaiting approval from the clinic.</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {appointment.status === 'approved' && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">Approved</span>
                                                            <span className="text-sm text-blue-500">Your appointment has been confirmed. Please arrive on time.</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {appointment.status === 'cancelled' && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                                            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-2 2l-2-2m-2 2l2 2" />
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium text-sm">Cancelled</p>
                                                                {appointment.cancelled_at && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled on {new Date(appointment.cancelled_at).toLocaleDateString()}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* View Details Link */}
                                                <Link href={route('patient.appointments.show', appointment.id)} className="block mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <Button variant="ghost" size="sm">
                                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                                                        </svg>
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}