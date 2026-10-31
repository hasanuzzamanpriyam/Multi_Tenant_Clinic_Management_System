'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Stethoscope,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle,
    Phone,
    Mail,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoctorItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    specialty: string | null;
    is_active: boolean;
    created_at: string;
    appointments_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDoctors {
    data: DoctorItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

export default function DoctorsIndex({
    doctors,
    filters,
}: {
    doctors: PaginatedDoctors;
    filters?: { search?: string };
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('clinic-admin.doctors.index'),
            { search: search || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (doctor: DoctorItem) => {
        if (confirm(`Are you sure you want to remove Dr. ${doctor.name} from your clinic? This will delete their account.`)) {
            setDeletingId(doctor.id);
            router.delete(route('clinic-admin.doctors.destroy', doctor.id), {
                onFinish: () => setDeletingId(null),
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Doctors Directory - Clinic Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard" className="text-slate-400 hover:text-[#0080FF] transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Doctors Management
                            </h1>
                            <Badge className="bg-[#0080FF] text-white ml-2 text-xs">
                                {doctors.total} Total
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage medical practitioners, specialties, contact profiles, and consultation accounts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('clinic-admin.approvals.index')}>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                                Check Approvals
                            </Button>
                        </Link>
                        <Link href={route('clinic-admin.doctors.create')}>
                            <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl gap-1.5 font-bold cursor-pointer shadow-xs">
                                <Plus className="h-4 w-4" />
                                Add Doctor
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5">
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search doctor by name or specialty..."
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
                                        router.get(route('clinic-admin.doctors.index'), {}, { preserveState: true });
                                    }}
                                    className="h-10 px-3 rounded-xl text-xs"
                                >
                                    Reset
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Doctors Table Card */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-[#0080FF]" />
                                    Clinic Doctors
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    All doctors affiliated with this clinic
                                </CardDescription>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                Page {doctors.current_page} of {doctors.last_page || 1}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {doctors.data.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-3">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No doctors found</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                    There are currently no doctors matching your search in this clinic.
                                </p>
                                <Link href={route('clinic-admin.doctors.create')} className="inline-block mt-4">
                                    <Button size="sm" className="bg-[#0080FF] text-white rounded-xl text-xs gap-1.5">
                                        <Plus className="h-3.5 w-3.5" />
                                        Add First Doctor
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200/80 dark:border-slate-800">
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Doctor</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Specialty</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Status</TableHead>
                                            <TableHead className="w-[140px] text-right text-xs font-bold text-slate-600 dark:text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {doctors.data.map((doctor) => (
                                            <TableRow key={doctor.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800 transition-colors">
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[#0080FF] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                            {doctor.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                Dr. {doctor.name.replace(/^dr\.?\s+/i, '')}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{doctor.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <Badge variant="outline" className="text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                                                        {doctor.specialty || 'General Practitioner'}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3 w-3 text-slate-400" />
                                                            <span>{doctor.email}</span>
                                                        </div>
                                                        {doctor.phone && (
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <Phone className="h-3 w-3 text-slate-400" />
                                                                <span>{doctor.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    {doctor.is_active ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-[11px] font-semibold gap-1 py-0.5">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-[11px] font-semibold gap-1 py-0.5">
                                                            <XCircle className="h-3 w-3" />
                                                            Pending Approval
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('clinic-admin.doctors.show', doctor.id)}>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-500 hover:text-[#0080FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('clinic-admin.doctors.edit', doctor.id)}>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer">
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(doctor)}
                                                            disabled={deletingId === doctor.id}
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
                        {doctors.links && doctors.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                <span className="text-xs text-slate-500">
                                    Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{doctors.data.length}</span> of{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{doctors.total}</span> doctors
                                </span>
                                <div className="flex items-center gap-1">
                                    {doctors.links.map((link, idx) => (
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

