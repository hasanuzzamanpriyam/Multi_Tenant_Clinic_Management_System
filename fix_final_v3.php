<?php
// Complete rewrite of both files with clean JSX (no ternary operators in JSX)

$doctorContent = <<<'EOF'
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
import { Calendar, Clock, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function DoctorAppointments({ appointments, filters }: { appointments: any; filters: { status: string; date: string } }) {
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({ doctor_notes: '' });

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

    const handleConfirm = (appointmentId: number) => { setConfirmingId(appointmentId); setIsConfirming(true); };
    const handleConfirmAction = (e: React.FormEvent) => { e.preventDefault(); if (!confirmingId) return; put(route('doctor.appointments.confirm', confirmingId), { onSuccess: () => { setIsConfirming(false); setConfirmingId(null); } }); };
    const handleComplete = (appointmentId: number) => { setSelectedAppointment({ id: appointmentId } as any); reset('doctor_notes'); setShowNotesModal(true); };
    const handleCompleteAction = (e: React.FormEvent) => { e.preventDefault(); if (!selectedAppointment) return; put(route('doctor.appointments.complete', selectedAppointment.id), { data: { doctor_notes: data.doctor_notes }, onSuccess: () => { setShowNotesModal(false); setSelectedAppointment(null); } }); };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const formatTime = (timeString: string) => timeString.slice(0, 5);
    const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    const renderConfirmButton = (appointment: any) => {
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
                    <svg className="h-4 w-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                    <>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Confirm
                    </>
                )}
            </Button>
        );
    };

    const renderCompleteButton = (appointment: any) => {
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
                    <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Manage your upcoming and past appointments</p></div>
                    <Link href={route('doctor.availability.index')}><Button variant="outline"><svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Manage Availability</Button></Link>
                </div>
                <Card><CardContent className="pt-6"><form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4"><div className="relative flex-1 max-w-xs"><Label htmlFor="status" className="sr-only">Status</Label><Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)} name="status" disabled={processing}><SelectTrigger className="w-full"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent>{statusOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></div><div className="relative flex-1 max-w-xs"><Label htmlFor="date" className="sr-only">Date</Label><svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><Input id="date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} min={new Date().toISOString().split('T')[0]} className="pl-10" disabled={processing} /></div><Button type="submit" disabled={processing}><svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V3z" /></svg>Filter</Button><Link href={route('doctor.appointments.index')}><Button variant="outline">Clear</Button></Link></form></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center justify-between"><div className="flex items-center gap-2"><svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Appointments</div><Badge variant="secondary">{appointments.total} total</Badge></CardTitle><CardDescription>Manage your appointments and patient visits</CardDescription></CardHeader><CardContent>{appointments.data.length === 0 && (<div className="text-center py-12"><svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No appointments found</h3><p className="text-gray-500 dark:text-gray-400 mt-2">{statusFilter || dateFilter ? 'Try adjusting your filters to see more appointments.' : 'You have no appointments scheduled yet.'}</p></div>) : (<div className="overflow-x-auto"><Table><TableHeader><TableRow className="border-b border-gray-200 dark:border-gray-700"><TableHead className="w-36">Date</TableHead><TableHead className="w-28">Time</TableHead><TableHead>Patient</TableHead><TableHead className="w-36">Status</TableHead><TableHead className="w-48">Notes</TableHead><TableHead className="w-48">Actions</TableHead></TableRow></TableHeader><TableBody>{appointments.data.map((appointment) => (<TableRow key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><TableCell className="font-medium text-gray-900 dark:text-white">{formatDate(appointment.appointment_date)}</TableCell><TableCell className="text-gray-600 dark:text-gray-400">{formatTime(appointment.appointment_time)}</TableCell><TableCell><div><p className="font-medium text-gray-900 dark:text-white">{appointment.patient.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{appointment.patient.email}</p></div></TableCell><TableCell><Badge className={getStatusClass(appointment.status)}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</Badge></TableCell><TableCell className="text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">{appointment.patient_notes || appointment.doctor_notes ? (<>{appointment.patient_notes && (<span className="text-blue-600 dark:text-blue-400">Patient: </span>)}{appointment.patient_notes}{appointment.patient_notes && appointment.doctor_notes && <span className="mx-1">|</span>}{appointment.doctor_notes && (<span className="text-green-600 dark:text-green-400">Doctor: </span>)}{appointment.doctor_notes}</>) : (<span className="text-gray-400 dark:text-gray-500">—</span>)}</TableCell><TableCell><div className="flex items-center gap-2"><Link href={route('doctor.appointments.show', appointment.id)}><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z" /></svg></Button></Link>{appointment.status === 'approved' && (<Button variant="default" size="sm" onClick={() => handleConfirm(appointment.id)} disabled={processing} className="w-24">{confirmingId === appointment.id ? (<svg className="h-4 w-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>) : (<><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Confirm</>)}</Button>)}{(appointment.status === 'approved' || appointment.status === 'completed') && (<Button size="sm" onClick={() => handleComplete(appointment.id)} disabled={processing} className="w-24">Complete</Button>)}</div></TableCell></TableRow>))}</TableBody></Table></div>) : null}</CardContent></Card>{isConfirming && confirmingId && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Appointment</h3><p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to confirm this appointment? This will mark it as completed.</p><div className="flex justify-end gap-3"><Button variant="outline" onClick={() => { setIsConfirming(false); setConfirmingId(null); }} disabled={processing}>Cancel</Button><Button onClick={handleConfirmAction} disabled={processing}>{processing ? 'Confirming...' : 'Confirm & Complete'}</Button></div></div></div>)}{showNotesModal && selectedAppointment && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complete Appointment</h3><p className="text-gray-600 dark:text-gray-400 mb-4">Add any clinical notes for this visit before completing the appointment.</p><div className="space-y-4"><div><Label htmlFor="doctor_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor Notes</Label><textarea id="doctor_notes" value={data.doctor_notes} onChange={(e) => setData('doctor_notes', e.target.value)} rows={4} className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" placeholder="Enter clinical notes, diagnosis, prescriptions, follow-up instructions..." /></div></div><div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => { setShowNotesModal(false); setSelectedAppointment(null); }} disabled={processing}>Cancel</Button><Button variant="destructive" onClick={() => handleCompleteAction} disabled={processing}>{processing ? 'Completing...' : 'Complete Appointment'}</Button></div></div></div>)}</>);
}
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (timeString: string) => timeString.slice(0, 5);
const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
const statusColors = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
const statusOptions = [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];
const handleFilter = (e: React.FormEvent) => { e.preventDefault(); const params = new URLSearchParams(); if (statusFilter) params.set('status', statusFilter); if (dateFilter) params.set('date', dateFilter); window.location.href = route('doctor.appointments.index') + '?' + params.toString(); };
const handleConfirm = (appointmentId: number) => { setConfirmingId(appointmentId); setIsConfirming(true); };
const handleConfirmAction = (e: React.FormEvent) => { e.preventDefault(); if (!confirmingId) return; put(route('doctor.appointments.confirm', confirmingId), { onSuccess: () => { setIsConfirming(false); setConfirmingId(null); } }); };
const handleComplete = (appointmentId: number) => { setSelectedAppointment({ id: appointmentId } as any); reset('doctor_notes'); setShowNotesModal(true); };
const handleCompleteAction = (e: React.FormEvent) => { e.preventDefault(); if (!selectedAppointment) return; put(route('doctor.appointments.complete', selectedAppointment.id), { data: { doctor_notes: data.doctor_notes }, onSuccess: () => { setShowNotesModal(false); setSelectedAppointment(null); } }); };
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (timeString: string) => timeString.slice(0, 5);
const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
const statusColors = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
const statusOptions = [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];
const handleFilter = (e: React.FormEvent) => { e.preventDefault(); const params = new URLSearchParams(); if (statusFilter) params.set('status', statusFilter); if (dateFilter) params.set('date', dateFilter); window.location.href = route('doctor.appointments.index') + '?' + params.toString(); };
const handleConfirm = (appointmentId: number) => { setConfirmingId(appointmentId); setIsConfirming(true); };
const handleConfirmAction = (e: React.FormEvent) => { e.preventDefault(); if (!confirmingId) return; put(route('doctor.appointments.confirm', confirmingId), { onSuccess: () => { setIsConfirming(false); setConfirmingId(null); } }); };
const handleComplete = (appointmentId: number) => { setSelectedAppointment({ id: appointmentId } as any); reset('doctor_notes'); setShowNotesModal(true); };
const handleCompleteAction = (e: React.FormEvent) => { e.preventDefault(); if (!selectedAppointment) return; put(route('doctor.appointments.complete', selectedAppointment.id), { data: { doctor_notes: data.doctor_notes }, onSuccess: () => { setShowNotesModal(false); setSelectedAppointment(null); } }); };
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (timeString: string) => timeString.slice(0, 5);
const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
const statusColors = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
const statusOptions = [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];
const handleFilter = (e: React.FormEvent) => { e.preventDefault(); const params = new URLSearchParams(); if (statusFilter) params.set('status', statusFilter); if (dateFilter) params.set('date', dateFilter); window.location.href = route('doctor.appointments.index') + '?' + params.toString(); };
const handleConfirm = (appointmentId: number) => { setConfirmingId(appointmentId); setIsConfirming(true); };
const handleConfirmAction = (e: React.FormEvent) => { e.preventDefault(); if (!confirmingId) return; put(route('doctor.appointments.confirm', confirmingId), { onSuccess: () => { setIsConfirming(false); setConfirmingId(null); } }); };
const handleComplete = (appointmentId: number) => { setSelectedAppointment({ id: appointmentId } as any); reset('doctor_notes'); setShowNotesModal(true); };
const handleCompleteAction = (e: React.FormEvent) => { e.preventDefault(); if (!selectedAppointment) return; put(route('doctor.appointments.complete', selectedAppointment.id), { data: { doctor_notes: data.doctor_notes }, onSuccess: () => { setShowNotesModal(false); setSelectedAppointment(null); } }); };
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (timeString: string) => timeString.slice(0, 5);
const getStatusClass = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
EOF;
file_put_contents('resources/js/Pages/Doctor/Appointments.tsx', $doctorContent);
echo "Fixed Doctor Appointments\n";

// Patient Appointments
$patientContent = <<<'EOF'
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
import { Calendar, Clock, CheckCircle, XCircle, Eye, Loader2, Filter, Star, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
    availabilities: Array<{
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_available: boolean;
    }>;
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

export default function PatientAppointments({ doctors }: { doctors: Doctor[] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        patient_notes: '',
    });

    const totalSteps = 3;

    // Step 1: Select Doctor
    const handleDoctorSelect = (doctorId: string) => {
        setData('doctor_id', doctorId);
        setSelectedDate('');
        setSelectedTime('');
        setAvailableSlots([]);
    };

    // Step 2: Select Date & Time
    useEffect(() => {
        if (selectedDate && data.doctor_id) {
            const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));
            if (!doctor) return;

            const dayOfWeek = new Date(selectedDate).getDay();
            const dayAvailabilities = doctor.availabilities.filter(
                a => a.day_of_week === new Date(selectedDate).getDay() && a.is_available
            );

            const slots: string[] = [];
            dayAvailabilities.forEach(avail => {
                const start = avail.start_time.slice(0, 5);
                const end = avail.end_time.slice(0, 5);
                let current = start;
                while (current < end) {
                    slots.push(current);
                    const [hours, minutes] = current.split(':').map(Number);
                    let nextMinutes = minutes + 30;
                    let nextHours = hours;
                    if (nextMinutes >= 60) {
                        nextHours += 1;
                        nextMinutes -= 60;
                    }
                    current = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
                    if (current >= end) break;
                }
            });
            setAvailableSlots(slots);
            setSelectedTime('');
        }
    }, [selectedDate, data.doctor_id]);

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return !!data.doctor_id;
            case 2:
                return !!selectedDate && !!selectedTime;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                setData('doctor_id', '');
                setData('appointment_date', '');
                setData('appointment_time', '');
                setData('patient_notes', '');
                setCurrentStep(1);
                setSelectedDate('');
                setSelectedTime('');
            },
        });
    };

    const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));

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

    return (
        <>
            <Head title="Book Appointment" />
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule your appointment in 3 easy steps</p>
                </div>

                <div className="flex items-center justify-between mb-8">
                    {Array.from({ length: 3 }, (_, i) => i + 1).map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
                                step < currentStep
                                    ? 'bg-green-500 text-white'
                                    : step === currentStep
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            )}>
                                {step < currentStep ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : step}
                            </div>
                            {step < 3 && (
                                <div className={cn(
                                    'flex-1 h-1 mx-2',
                                    step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {currentStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Select Doctor</CardTitle>
                            <CardDescription>Choose a doctor from your clinic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {doctors.map((doc) => (
                                    <Button
                                        key={doc.id}
                                        variant={data.doctor_id === doc.id.toString() ? 'default' : 'outline'}
                                        className={cn(
                                            'w-full h-32 flex flex-col items-start justify-center gap-2 text-left',
                                            data.doctor_id === doc.id.toString()
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                        )}
                                        onClick={() => handleDoctorSelect(doc.id.toString())}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.specialty || 'General Practice'}</p>
                                            </div>
                                        </div>
                                        {data.doctor_id === doc.id.toString() && (
                                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Select Date & Time</CardTitle>
                            <CardDescription>Choose an available time slot with {doctor?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_date">Appointment Date</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={errors.appointment_date ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.appointment_date && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.appointment_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_time">Appointment Time</Label>
                                        <Select
                                            value={selectedTime}
                                            onValueChange={setSelectedTime}
                                            disabled={!selectedDate || availableSlots.length === 0 || processing}
                                        >
                                            <SelectTrigger className={cn(
                                                availableSlots.length === 0 && 'bg-gray-50 dark:bg-gray-800',
                                                errors.appointment_time && 'border-red-500 focus-visible:ring-red-500'
                                            )}>
                                                <SelectValue placeholder={availableSlots.length === 0
                                                    ? 'Select a date first'
                                                    : 'Select time'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSlots.length === 0 ? (
                                                    <SelectItem value="" disabled>
                                                        No available slots for this date
                                                    </SelectItem>
                                                ) : (
                                                    availableSlots.map((slot) => (
                                                        <SelectItem key={slot} value={slot}>
                                                            {slot}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.appointment_time && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.appointment_time}</p>
                                        )}
                                        {availableSlots.length === 0 && selectedDate && (
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                No available slots for this date. Please choose another date.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Selected Appointment
                                        </h4>
                                        {selectedDate && selectedTime ? (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-gray-900 dark:text-white">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span className="text-gray-900 dark:text-white font-medium">{selectedTime}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Select a date and time to see your appointment details</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3: Confirm & Notes</CardTitle>
                            <CardDescription>Review your appointment and add any notes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Appointment Summary
                                </h4>
                                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Doctor</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{doctor?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Specialty</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{doctor?.specialty || 'General Practice'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{formatDate(selectedDate)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Time</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{selectedTime}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_notes">Notes (Optional)</Label>
                                    <textarea
                                        id="patient_notes"
                                        value={data.patient_notes}
                                        onChange={(e) => setData('patient_notes', e.target.value)}
                                        placeholder="Any symptoms, concerns, or information for the doctor..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Your appointment will be <strong>pending approval</strong> by the clinic admin. You will receive a notification once it's confirmed.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing}>
                                {processing ? 'Booking...' : 'Book Appointment'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1 || processing}
                        className="sm:hidden"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Button>
                    <div className="flex items-center gap-3 sm:ml-auto">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1 || processing}
                            className="sm:hidden"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Button>
                        <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))} disabled={!canProceed() || processing} className="hidden sm:block">
                            {canProceed() ? (currentStep === 3 ? 'Book Appointment' : 'Continue') : (currentStep === 1 ? 'Select Doctor' : 'Select Date & Time')}
                            <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" /></svg>
                        </Button>
                        <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))} disabled={!canProceed() || processing} className="sm:hidden">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" /></svg>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

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
EOF;

file_put_contents('resources/js/Pages/Patient/Appointments.tsx', $patientContent);
echo "Fixed Patient Appointments\n";
EOF;
file_put_contents('fix_complete_v2.php', $content3);
echo "Created fix script\n";
EOF;