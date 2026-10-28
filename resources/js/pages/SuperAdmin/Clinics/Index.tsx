'use client';

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Clinic {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    users_count: number;
    appointments_count: number;
    created_at: string;
}

interface Clinics {
    data: Clinic[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function ClinicsIndex({ clinics, filters }: { clinics: Clinics; filters: { search: string } }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { get, processing, delete: destroy } = useForm({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.clinics.index'), { search }, { preserveScroll: true });
    };

    const handleDelete = (clinicId: number) => {
        if (confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
            setDeletingId(clinicId);
            destroy(route('admin.clinics.destroy', clinicId), {
                onSuccess: () => setDeletingId(null),
            });
        }
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
            <Head title="Clinic Management" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinic Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all clinics in the system</p>
                    </div>
                    <Link href={route('admin.clinics.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Clinic
                        </Button>
                    </Link>
                </div>

                {/* Search & Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search clinics..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Search
                            </Button>
                            <Link href={route('admin.clinics.index')}>
                                <Button variant="outline">Clear</Button>
                            </Link>
                        </form>
                    </CardContent>
                </Card>

                {/* Clinics Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            All Clinics
                            <Badge variant="secondary" className="ml-2">
                                {clinics.total} clinics
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {clinics.data.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2zM9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No clinics found</h3>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating your first clinic.</p>
                                <Link href={route('admin.clinics.create')} className="mt-4 inline-block">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Clinic
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-10">#</TableHead>
                                            <TableHead>Clinic</TableHead>
                                            <TableHead className="w-48">Contact</TableHead>
                                            <TableHead className="w-32">Users</TableHead>
                                            <TableHead className="w-32">Appointments</TableHead>
                                            <TableHead className="w-32">Created</TableHead>
                                            <TableHead className="w-48">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clinics.data.map((clinic) => (
                                            <TableRow key={clinic.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="text-gray-500 dark:text-gray-400">
                                                    {clinic.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{clinic.name}</p>
                                                                {clinic.address && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                        {clinic.address}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-4 h-4 text-gray-400">@</span>
                                                            <span>{clinic.email}</span>
                                                        </div>
                                                        {clinic.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-4 h-4 text-gray-400">📞</span>
                                                                <span className="text-sm">{clinic.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <Users className="h-4 w-4" />
                                                        <span>{clinic.users_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{clinic.appointments_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(clinic.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('admin.clinics.show', clinic.id)}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.clinics.edit', clinic.id)}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                                                onClick={() => handleDelete(clinic.id)}
                                                disabled={processing}
                                            >
                                                {deletingId === clinic.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
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
                    </CardContent>
                </Card>

                {/* Pagination handled by Inertia */}
            </div>
        </>
    );
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}