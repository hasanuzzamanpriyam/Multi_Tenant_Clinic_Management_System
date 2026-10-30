'use client';

import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    User,
    Pill,
    FileText,
    Printer,
    ArrowLeft,
    Building2,
    CheckCircle2,
    AlertCircle,
    Info,
} from 'lucide-react';
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
    email: string;
    phone: string | null;
    specialty: string | null;
}

interface Clinic {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
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
    clinic?: Clinic;
    prescriptions?: Prescription[];
}

const statusColors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function AppointmentShow({ appointment }: { appointment: Appointment }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => timeString.slice(0, 5);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Appointment #${appointment.id} Details`} />

            <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-none">
                {/* Top Action Bar (hidden in print) */}
                <div className="flex items-center justify-between print:hidden">
                    <Link href={route('patient.appointments.index')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Appointments
                        </Button>
                    </Link>

                    {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                            <Printer className="h-4 w-4" />
                            Print Prescription
                        </Button>
                    )}
                </div>

                {/* Printable Header / Clinic Info */}
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Appointment Details & Prescription
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Appointment ID: #{appointment.id}
                                </p>
                            </div>
                            <div>
                                <Badge
                                    className={cn(
                                        'text-sm px-3 py-1 font-semibold uppercase tracking-wider',
                                        statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                                    )}
                                >
                                    {appointment.status}
                                </Badge>
                            </div>
                        </div>

                        {appointment.clinic && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{appointment.clinic.name}</p>
                                    {appointment.clinic.address && <p>{appointment.clinic.address}</p>}
                                    <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                                        {appointment.clinic.phone && <span>Phone: {appointment.clinic.phone}</span>}
                                        {appointment.clinic.email && <span>Email: {appointment.clinic.email}</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {/* Doctor and Schedule Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Attending Doctor</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{appointment.doctor.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.doctor.specialty || 'General Practice'}</p>
                                    {appointment.doctor.email && (
                                        <p className="text-xs text-gray-500 mt-1">{appointment.doctor.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Schedule</p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                                        {formatDate(appointment.appointment_date)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                        {formatTime(appointment.appointment_time)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Notes */}
                        {appointment.patient_notes && (
                            <div className="border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Your Notes / Reason for Visit</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{appointment.patient_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Doctor Notes */}
                        {appointment.doctor_notes && (
                            <div className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-200 text-sm">Doctor's Diagnosis & Clinical Notes</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">{appointment.doctor_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Prescriptions Section */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Prescriptions (Rx)</h2>
                                </div>
                                {appointment.prescriptions && (
                                    <Badge variant="outline" className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                                        {appointment.prescriptions.length} {appointment.prescriptions.length === 1 ? 'Medicine' : 'Medicines'}
                                    </Badge>
                                )}
                            </div>

                            {appointment.prescriptions && appointment.prescriptions.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    {appointment.prescriptions.map((rx, idx) => (
                                        <div key={rx.id || idx} className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/80 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                                            #{idx + 1}
                                                        </span>
                                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                                            {rx.medicine_name}
                                                        </h4>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 pt-1">
                                                        <span><strong>Dosage:</strong> {rx.dosage}</span>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <span><strong>Frequency:</strong> {rx.frequency}</span>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <span><strong>Duration:</strong> {rx.duration}</span>
                                                    </div>

                                                    {rx.special_instructions && (
                                                        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded mt-2 inline-block">
                                                            <strong>Special Instructions:</strong> {rx.special_instructions}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border border-dashed rounded-lg text-gray-500 dark:text-gray-400">
                                    <Pill className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-sm">No prescriptions were issued for this appointment.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

