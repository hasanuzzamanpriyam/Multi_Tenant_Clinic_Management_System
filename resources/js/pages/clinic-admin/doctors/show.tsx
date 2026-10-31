'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Stethoscope,
    Edit2,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Plus,
    Trash2,
    Save,
    X,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Availability {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DoctorShowProps {
    doctor: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        specialty: string | null;
        gender: string | null;
        is_active: boolean;
        created_at: string;
        availabilities?: Availability[];
        appointments?: any[];
    };
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ShowDoctor({ doctor }: DoctorShowProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<Availability | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const [formDay, setFormDay] = useState(1);
    const [formStart, setFormStart] = useState('09:00');
    const [formEnd, setFormEnd] = useState('17:00');
    const [formAvailable, setFormAvailable] = useState(true);

    const handleOpenAdd = () => {
        setEditingSlot(null);
        setFormDay(1); // Monday default
        setFormStart('09:00');
        setFormEnd('17:00');
        setFormAvailable(true);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (slot: Availability) => {
        setEditingSlot(slot);
        setFormDay(slot.day_of_week);
        setFormStart(slot.start_time.slice(0, 5));
        setFormEnd(slot.end_time.slice(0, 5));
        setFormAvailable(slot.is_available);
        setIsFormOpen(true);
    };

    const handleSaveSlot = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            day_of_week: Number(formDay),
            start_time: formStart,
            end_time: formEnd,
            is_available: formAvailable,
        };

        if (editingSlot) {
            router.put(
                route('clinic-admin.doctors.availability.update', [doctor.id, editingSlot.id]),
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsFormOpen(false);
                        setEditingSlot(null);
                    },
                    onFinish: () => setProcessing(false),
                }
            );
        } else {
            router.post(
                route('clinic-admin.doctors.availability.store', doctor.id),
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsFormOpen(false);
                    },
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    const handleDeleteSlot = (slot: Availability) => {
        if (confirm(`Remove the ${dayNames[slot.day_of_week]} schedule slot (${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)})?`)) {
            setDeletingId(slot.id);
            router.delete(
                route('clinic-admin.doctors.availability.destroy', [doctor.id, slot.id]),
                {
                    preserveScroll: true,
                    onFinish: () => setDeletingId(null),
                }
            );
        }
    };

    const formatTimeDisplay = (time: string) => {
        if (!time) return '';
        const parts = time.split(':');
        const hour = parseInt(parts[0], 10);
        const minute = parts[1] || '00';
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    return (
        <>
            <Head title={`Dr. ${doctor.name.replace(/^dr\.?\s+/i, '')} - Doctor Profile`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('clinic-admin.doctors.index')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Dr. {doctor.name.replace(/^dr\.?\s+/i, '')}
                                </h1>
                                {doctor.is_active ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                                        <XCircle className="h-3 w-3 mr-1" /> Pending
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {doctor.specialty || 'General Practitioner'} · Registered {new Date(doctor.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <Link href={route('clinic-admin.doctors.edit', doctor.id)}>
                        <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl gap-1.5 font-bold cursor-pointer">
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3 items-start">
                    {/* Contact & Info Card */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="h-4 w-4 text-[#0080FF]" />
                                Practitioner Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            <div>
                                <span className="text-slate-400 block mb-0.5">Email</span>
                                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{doctor.email}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Phone</span>
                                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{doctor.phone || 'Not provided'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Specialty</span>
                                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                                    {doctor.specialty || 'General Practitioner'}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Gender</span>
                                <span className="capitalize font-medium text-slate-800 dark:text-slate-200">
                                    {doctor.gender || 'Not specified'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule / Availabilities (Interactive Editor) */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs md:col-span-2">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#0080FF]" />
                                    Weekly Consultation Schedule
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Set and manage doctor consultation hours and weekly shifts
                                </CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleOpenAdd}
                                className="bg-[#0080FF] hover:bg-[#0070E0] text-white text-xs font-bold rounded-xl gap-1 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Slot</span>
                            </Button>
                        </CardHeader>

                        <CardContent className="pt-4 space-y-4">
                            {/* Inline Add / Edit Form */}
                            {isFormOpen && (
                                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/50">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-[#0080FF]" />
                                            {editingSlot ? 'Edit Time Slot' : 'Add Consultation Time Slot'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setIsFormOpen(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveSlot} className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="day_of_week" className="text-xs font-semibold">Day of Week</Label>
                                                <select
                                                    id="day_of_week"
                                                    value={formDay}
                                                    onChange={(e) => setFormDay(Number(e.target.value))}
                                                    className="w-full h-9 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-background px-3"
                                                >
                                                    {dayNames.map((name, idx) => (
                                                        <option key={idx} value={idx}>{name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="start_time" className="text-xs font-semibold">Start Time</Label>
                                                <Input
                                                    id="start_time"
                                                    type="time"
                                                    value={formStart}
                                                    onChange={(e) => setFormStart(e.target.value)}
                                                    className="h-9 rounded-xl text-xs"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="end_time" className="text-xs font-semibold">End Time</Label>
                                                <Input
                                                    id="end_time"
                                                    type="time"
                                                    value={formEnd}
                                                    onChange={(e) => setFormEnd(e.target.value)}
                                                    className="h-9 rounded-xl text-xs"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formAvailable}
                                                    onChange={(e) => setFormAvailable(e.target.checked)}
                                                    className="rounded border-slate-300 text-[#0080FF] focus:ring-[#0080FF]"
                                                />
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    Available for booking
                                                </span>
                                            </label>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsFormOpen(false)}
                                                    className="h-8 rounded-xl text-xs"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={processing}
                                                    className="h-8 rounded-xl bg-[#0080FF] hover:bg-[#0070E0] text-white text-xs font-bold gap-1 cursor-pointer"
                                                >
                                                    {processing ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Save className="h-3.5 w-3.5" />
                                                    )}
                                                    {editingSlot ? 'Update Slot' : 'Save Slot'}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Schedule Slots List */}
                            {doctor.availabilities && doctor.availabilities.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {doctor.availabilities.map((av) => (
                                        <div
                                            key={av.id}
                                            className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card flex items-center justify-between text-xs hover:border-[#0080FF]/50 transition-colors group"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {dayNames[av.day_of_week] || `Day ${av.day_of_week}`}
                                                    </span>
                                                    {av.is_available ? (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Available" />
                                                    ) : (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" title="Unavailable" />
                                                    )}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    <span>{formatTimeDisplay(av.start_time)} – {formatTimeDisplay(av.end_time)}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(av)}
                                                    className="h-7 w-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                                                    title="Edit hours"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={deletingId === av.id}
                                                    onClick={() => handleDeleteSlot(av)}
                                                    className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                    title="Delete slot"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <Clock className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        No consultation hours set for Dr. {doctor.name.replace(/^dr\.?\s+/i, '')}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                                        Add weekly consultation shifts so patients can schedule appointments.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={handleOpenAdd}
                                        className="bg-[#0080FF] hover:bg-[#0070E0] text-white text-xs font-bold rounded-xl gap-1"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add First Time Slot
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Consultations Table */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#0080FF]" />
                            Recent Consultations & Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {doctor.appointments && doctor.appointments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 dark:border-slate-800 text-xs">
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctor.appointments.map((apt: any) => (
                                        <TableRow key={apt.id} className="text-xs border-slate-100 dark:border-slate-800">
                                            <TableCell className="font-semibold">{apt.patient?.name || 'Patient'}</TableCell>
                                            <TableCell>
                                                {apt.appointment_date ? apt.appointment_date.split('T')[0] : ''} {apt.appointment_time || ''}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {apt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-xs text-slate-500 py-8 text-center">
                                No consultations recorded for this doctor yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
