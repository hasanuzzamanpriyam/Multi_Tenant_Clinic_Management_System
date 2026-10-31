'use client';

import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Users,
    Edit2,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    User,
} from 'lucide-react';

export default function ShowPatient({ patient }: { patient: any }) {
    return (
        <>
            <Head title={`Patient Profile: ${patient.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('clinic-admin.patients.index')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {patient.name}
                                </h1>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active Patient
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Enrolled {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <Link href={route('clinic-admin.patients.edit', patient.id)}>
                        <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl gap-1.5 font-bold cursor-pointer">
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Patient Information */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="h-4 w-4 text-[#0080FF]" />
                                Personal Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            <div>
                                <span className="text-slate-400 block mb-0.5">Email</span>
                                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{patient.email}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Phone</span>
                                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{patient.phone || 'Not provided'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Gender</span>
                                <span className="capitalize font-medium text-slate-800 dark:text-slate-200">
                                    {patient.gender || 'Not specified'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Age</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {patient.age ? `${patient.age} years old` : 'Not specified'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consultation History */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs md:col-span-2 overflow-hidden">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6">
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#0080FF]" />
                                Appointments & Consultations History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {patient.appointments && patient.appointments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-100 dark:border-slate-800 text-xs">
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patient.appointments.map((apt: any) => (
                                            <TableRow key={apt.id} className="text-xs border-slate-100 dark:border-slate-800">
                                                <TableCell className="font-semibold">{apt.doctor ? `Dr. ${apt.doctor.name}` : 'Doctor'}</TableCell>
                                                <TableCell>{apt.appointment_date} {apt.appointment_time || ''}</TableCell>
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
                                    No appointment history found for this patient yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

