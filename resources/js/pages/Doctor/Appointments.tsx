'use client';

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Loader2, Filter, Plus, Trash2, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prescription {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    special_instructions: string;
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
    patient: { id: number; name: string; email: string; phone: string | null };
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

export default function DoctorAppointments({ appointments, filters }: { appointments: AppointmentsData; filters: { status: string; date: string } }) {
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        doctor_notes: '',
        prescriptions: [] as Prescription[],
    });

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        if (dateFilter) params.set('date', dateFilter);
        window.location.href = route('doctor.appointments.index') + '?' + params.toString();
    };

    const handleConfirm = (appointmentId: number) => {
        setConfirmingId(appointmentId);
        setIsConfirming(true);
    };

    const handleConfirmAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmingId) return;
        post(route('doctor.appointments.confirm', confirmingId), {
            onSuccess: () => {
                setIsConfirming(false);
                setConfirmingId(null);
            },
        });
    };

    const handleComplete = (appointmentId: number) => {
        setSelectedAppointment({ id: appointmentId } as any);
        reset('doctor_notes');
        reset('prescriptions');
        setData({
            doctor_notes: '',
            prescriptions: [],
        });
        setShowNotesModal(true);
    };

    const handleCompleteAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;
        post(route('doctor.appointments.complete', selectedAppointment.id), {
            onSuccess: () => {
                setShowNotesModal(false);
                setSelectedAppointment(null);
            },
        });
    };

    const addPrescription = () => {
        setData('prescriptions', [...data.prescriptions, {
            medicine_name: '',
            dosage: '',
            frequency: '',
            duration: '',
            special_instructions: '',
        }]);
    };

    const removePrescription = (index: number) => {
        const updated = [...data.prescriptions];
        updated.splice(index, 1);
        setData('prescriptions', updated);
    };

    const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
        const updated = [...data.prescriptions];
        updated[index] = { ...updated[index], [field]: value };
        setData('prescriptions', updated);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const formatTime = (timeString: string) => timeString.slice(0, 5);
    const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    const renderConfirmButton = (appointment: Appointment) => {
        if (appointment.status !== 'approved') return null;
        return (
            <Button
                variant="default"
                size="sm"
                onClick={() => handleConfirm(appointment.id)}
                disabled={processing}
                className="w-24"
            >
                {confirmingId === appointment.id ? (
                    <svg className="h-4 w-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm
                    </>
                )}
            </Button>
        );
    };

    const renderCompleteButton = (appointment: Appointment) => {
        if (appointment.status !== 'approved' && appointment.status !== 'completed') return null;
        return (
            <Button
                size="sm"
                onClick={() => handleComplete(appointment.id)}
                disabled={processing}
                className="w-24"
            >
                Complete
            </Button>
        );
    };

    return (
        <>
            <Head title="My Appointments" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your upcoming and past appointments</p>
                    </div>
                    <Link href={route('doctor.availability.index')}>
                        <Button variant="outline">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Manage Availability
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 max-w-xs">
                                <Label htmlFor="status" className="sr-only">Status</Label>
                                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)} name="status" disabled={processing}>
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

                            <div className="relative flex-1 max-w-xs">
                                <Label htmlFor="date" className="sr-only">Date</Label>
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <Input
                                    id="date"
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="pl-10"
                                    disabled={processing}
                                />
                            </div>

                            <Button type="submit" disabled={processing}>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V3z" />
                                </svg>
                                Filter
                            </Button>
                            <Link href={route('doctor.appointments.index')}>
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
                                Appointments
                            </div>
                            <Badge variant="secondary">{appointments.total} total</Badge>
                        </CardTitle>
                        <CardDescription>Manage your appointments and patient visits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No appointments found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {statusFilter || dateFilter
                                        ? 'Try adjusting your filters to see more appointments.'
                                        : 'You have no appointments scheduled yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-36">Date</TableHead>
                                            <TableHead className="w-28">Time</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead className="w-36">Status</TableHead>
                                            <TableHead className="w-48">Notes</TableHead>
                                            <TableHead className="w-48">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.data.map((appointment) => (
                                            <TableRow key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(appointment.appointment_date)}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {formatTime(appointment.appointment_time)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{appointment.patient.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.patient.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusClass(appointment.status)}>
                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">
                                                    {appointment.patient_notes || appointment.doctor_notes ? (
                                                        <>
                                                            {appointment.patient_notes && (
                                                                <span className="text-blue-600 dark:text-blue-400">Patient: </span>
                                                            )}
                                                            {appointment.patient_notes}
                                                            {appointment.patient_notes && appointment.doctor_notes && <span className="mx-1">|</span>}
                                                            {appointment.doctor_notes && (
                                                                <span className="text-green-600 dark:text-green-400">Doctor: </span>
                                                            )}
                                                            {appointment.doctor_notes}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('doctor.appointments.show', appointment.id)}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                                                                </svg>
                                                            </Button>
                                                        </Link>
                                                        {appointment.status === 'approved' && renderConfirmButton(appointment)}
                                                        {(appointment.status === 'approved' || appointment.status === 'completed') && renderCompleteButton(appointment)}
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

                {isConfirming && confirmingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Confirm Appointment
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to confirm this appointment? This will mark it as completed.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => { setIsConfirming(false); setConfirmingId(null); }} disabled={processing}>
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirmAction} disabled={processing}>
                                    {processing ? 'Confirming...' : 'Confirm & Complete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showNotesModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Appointment</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Add clinical notes and prescriptions for this visit.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="doctor_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Doctor Notes
                                    </Label>
                                    <textarea
                                        id="doctor_notes"
                                        value={data.doctor_notes}
                                        onChange={(e) => setData('doctor_notes', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                        placeholder="Enter clinical notes, diagnosis, follow-up instructions..."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prescriptions</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Medicine
                                        </Button>
                                    </div>
                                    {data.prescriptions.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                            No medicines added yet. Click "Add Medicine" to prescribe.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.prescriptions.map((prescription, index) => (
                                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">Medicine #{index + 1}</h4>
                                                        <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-400" onClick={() => removePrescription(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`medicine_name_${index}`}>Medicine Name</Label>
                                                            <Input
                                                                id={`medicine_name_${index}`}
                                                                value={prescription.medicine_name}
                                                                onChange={(e) => updatePrescription(index, 'medicine_name', e.target.value)}
                                                                placeholder="e.g., Amoxicillin"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`dosage_${index}`}>Dosage</Label>
                                                            <Input
                                                                id={`dosage_${index}`}
                                                                value={prescription.dosage}
                                                                onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                                                                placeholder="e.g., 500mg"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`frequency_${index}`}>Frequency</Label>
                                                            <Select value={prescription.frequency} onValueChange={(v) => updatePrescription(index, 'frequency', v)}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select frequency" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Once daily">Once daily</SelectItem>
                                                                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                                                                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                                                                    <SelectItem value="Four times daily">Four times daily</SelectItem>
                                                                    <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                                                    <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                                                                    <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                                                                    <SelectItem value="As needed">As needed (PRN)</SelectItem>
                                                                    <SelectItem value="Before meals">Before meals</SelectItem>
                                                                    <SelectItem value="After meals">After meals</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`duration_${index}`}>Duration</Label>
                                                            <Input
                                                                id={`duration_${index}`}
                                                                value={prescription.duration}
                                                                onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                                                                placeholder="e.g., 7 days"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Label htmlFor={`special_instructions_${index}`}>Special Instructions (Optional)</Label>
                                                        <textarea
                                                            id={`special_instructions_${index}`}
                                                            value={prescription.special_instructions}
                                                            onChange={(e) => updatePrescription(index, 'special_instructions', e.target.value)}
                                                            rows={2}
                                                            className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                                            placeholder="e.g., Take with food, avoid dairy..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button variant="outline" onClick={() => { setShowNotesModal(false); setSelectedAppointment(null); }} disabled={processing}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCompleteAction} disabled={processing} className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold">
                                    {processing ? 'Saving & Completing...' : 'Save Notes & Complete Appointment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}