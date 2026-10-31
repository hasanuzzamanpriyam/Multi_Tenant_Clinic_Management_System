'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    Phone,
    Mail,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    age: number | null;
    gender: string | null;
    is_active: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPatients {
    data: PatientItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

export default function PatientsIndex({
    patients,
    filters,
}: {
    patients: PaginatedPatients;
    filters?: { search?: string };
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('clinic-admin.patients.index'),
            { search: search || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (patient: PatientItem) => {
        if (confirm(`Are you sure you want to remove patient "${patient.name}"? This action cannot be undone.`)) {
            setDeletingId(patient.id);
            router.delete(route('clinic-admin.patients.destroy', patient.id), {
                onFinish: () => setDeletingId(null),
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Patients Directory - Clinic Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard" className="text-slate-400 hover:text-[#0080FF] transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Patients Directory
                            </h1>
                            <Badge className="bg-[#0080FF] text-white ml-2 text-xs">
                                {patients.total} Registered
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            View registered clinic patients, medical history, appointment bookings, and records.
                        </p>
                    </div>

                    <Link href={route('clinic-admin.patients.create')}>
                        <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl gap-1.5 font-bold cursor-pointer shadow-xs">
                            <Plus className="h-4 w-4" />
                            Add Patient
                        </Button>
                    </Link>
                </div>

                {/* Search & Filter Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5">
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search patient by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 text-sm rounded-xl"
                                />
                            </div>
                            <Button type="submit" className="h-10 px-5 rounded-xl bg-[#0080FF] hover:bg-[#0070E0] text-white font-semibold text-xs cursor-pointer">
                                Search
                            </Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('clinic-admin.patients.index'), {}, { preserveState: true });
                                    }}
                                    className="h-10 px-3 rounded-xl text-xs"
                                >
                                    Reset
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Patients Table Card */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#0080FF]" />
                                    Clinic Patients
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Listing all registered patients enrolled with this facility
                                </CardDescription>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                Page {patients.current_page} of {patients.last_page || 1}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {patients.data.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No patients found</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                    There are currently no patients enrolled under this clinic matching your criteria.
                                </p>
                                <Link href={route('clinic-admin.patients.create')} className="inline-block mt-4">
                                    <Button size="sm" className="bg-[#0080FF] text-white rounded-xl text-xs gap-1.5">
                                        <Plus className="h-3.5 w-3.5" />
                                        Enroll First Patient
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200/80 dark:border-slate-800">
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Patient</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Demographics</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Status</TableHead>
                                            <TableHead className="w-[140px] text-right text-xs font-bold text-slate-600 dark:text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.data.map((patient) => (
                                            <TableRow key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800 transition-colors">
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                            {patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                {patient.name}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{patient.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3 w-3 text-slate-400" />
                                                            <span>{patient.email}</span>
                                                        </div>
                                                        {patient.phone && (
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <Phone className="h-3 w-3 text-slate-400" />
                                                                <span>{patient.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                                        <span>{patient.gender ? (patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)) : 'N/A'}</span>
                                                        {patient.age && <span> · {patient.age} yrs</span>}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-[11px] font-semibold gap-1 py-0.5">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('clinic-admin.patients.show', patient.id)}>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-500 hover:text-[#0080FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('clinic-admin.patients.edit', patient.id)}>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer">
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(patient)}
                                                            disabled={deletingId === patient.id}
                                                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {patients.links && patients.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                <span className="text-xs text-slate-500">
                                    Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{patients.data.length}</span> of{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{patients.total}</span> patients
                                </span>
                                <div className="flex items-center gap-1">
                                    {patients.links.map((link, idx) => (
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

