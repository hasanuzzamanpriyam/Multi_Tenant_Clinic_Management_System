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
    UserPlus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Building2,
    Shield,
    Stethoscope,
    User,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Clinic {
    id: number;
    name: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    specialty: string | null;
    is_active: boolean;
    tenant_id: number | null;
    created_at: string;
    clinic?: Clinic | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

export default function UsersIndex({
    users,
    filters,
    clinics = [],
}: {
    users: PaginatedUsers;
    filters?: { search?: string; role?: string };
    clinics?: Clinic[];
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || '');
    const [searching, setSearching] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        router.get(
            route('admin.users.index'),
            { search: search || undefined, role: role || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setSearching(false),
            }
        );
    };

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        router.get(
            route('admin.users.index'),
            { search: search || undefined, role: newRole || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (userItem: UserItem) => {
        if (confirm(`Are you sure you want to delete user "${userItem.name}"? This action cannot be undone.`)) {
            setDeletingId(userItem.id);
            router.delete(route('admin.users.destroy', userItem.id), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const getRoleBadge = (userRole: string) => {
        switch (userRole) {
            case 'super_admin':
                return (
                    <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Super Admin
                    </Badge>
                );
            case 'clinic_admin':
                return (
                    <Badge className="bg-[#0080FF]/10 text-[#0080FF] border-[#0080FF]/30">
                        <Building2 className="h-3 w-3 mr-1" />
                        Clinic Admin
                    </Badge>
                );
            case 'doctor':
                return (
                    <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Doctor
                    </Badge>
                );
            case 'patient':
                return (
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200">
                        <User className="h-3 w-3 mr-1" />
                        Patient
                    </Badge>
                );
            default:
                return <Badge variant="outline">{userRole}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title="User Management - Super Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                System Users
                            </h1>
                            <Badge className="bg-blue-50 text-[#0080FF] border-[#0080FF]/30">
                                {users.total} Total
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Manage all system administrators, clinic staff, medical practitioners, and patients.
                        </p>
                    </div>

                    <Link href={route('admin.users.create')}>
                        <Button className="bg-[#0080FF] hover:bg-[#0066CC] text-white font-medium gap-2 rounded-xl cursor-pointer shadow-xs">
                            <UserPlus className="h-4 w-4" />
                            Add New User
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or email address..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={role}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0080FF]"
                                >
                                    <option value="">All Roles</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="clinic_admin">Clinic Admin</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="patient">Patient</option>
                                </select>

                                <Button
                                    type="submit"
                                    disabled={searching}
                                    className="h-10 px-4 bg-[#0080FF] hover:bg-[#0066CC] text-white rounded-xl font-medium cursor-pointer"
                                >
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Search className="h-4 w-4 mr-1.5" />}
                                    Search
                                </Button>

                                {(search || role) && (
                                    <Link href={route('admin.users.index')}>
                                        <Button type="button" variant="outline" className="h-10 rounded-xl cursor-pointer">
                                            Reset
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#0080FF]" />
                            User Directory
                        </CardTitle>
                        <Badge variant="outline">{users.total} entries</Badge>
                    </CardHeader>
                    <CardContent>
                        {users.data.length === 0 ? (
                            <div className="text-center py-14">
                                <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                                    No users found
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Try adjusting your search criteria or register a new user.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Assigned Clinic</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Registered</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0080FF] to-[#16134D] text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                            {u.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                                                {u.name}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>{getRoleBadge(u.role)}</TableCell>

                                                <TableCell>
                                                    {u.clinic ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            <Building2 className="h-3.5 w-3.5 text-[#0080FF]" />
                                                            {u.clinic.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">
                                                            System-Wide (Cross-Tenant)
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                                    {u.phone || '—'}
                                                    {u.specialty && (
                                                        <span className="block text-[11px] text-slate-400">
                                                            {u.specialty}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {u.is_active ? (
                                                        <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 text-[11px]">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[11px]">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-xs text-slate-400">
                                                    {formatDate(u.created_at)}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={route('admin.users.edit', u.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:text-[#0080FF]"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(u)}
                                                            disabled={deletingId === u.id}
                                                            className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                                                        >
                                                            {deletingId === u.id ? (
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

                        {/* Pagination */}
                        {users.links && users.links.length > 3 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                                <div className="text-xs text-slate-500">
                                    Showing {(users.current_page - 1) * users.per_page + 1} to{' '}
                                    {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {users.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={cn(
                                                'px-3 py-1.5 text-xs rounded-lg transition-colors font-medium',
                                                !link.url && 'opacity-40 pointer-events-none text-slate-400',
                                                link.active
                                                    ? 'bg-[#0080FF] text-white shadow-xs'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

