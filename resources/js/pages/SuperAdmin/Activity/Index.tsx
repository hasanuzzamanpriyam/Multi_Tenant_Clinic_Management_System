'use client';

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Activity,
    Users,
    Calendar,
    Stethoscope,
    Building2,
    Search,
    Filter,
    ArrowLeft,
    Clock,
    ExternalLink,
    RefreshCw,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: string;
    category: 'users' | 'appointments' | 'prescriptions' | 'clinics';
    category_label: string;
    action: string;
    user_name: string;
    user_role: string;
    entity: string;
    clinic_name: string;
    clinic_id: number | null;
    details: string;
    status: string;
    type: string;
    time: string;
    created_at: string | null;
    timestamp: number;
    link: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedActivities {
    data: ActivityItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: PaginationLink[];
}

interface Clinic {
    id: number;
    name: string;
}

export default function ActivityIndex({
    activities,
    filters,
    clinics = [],
    totalCount = 0,
}: {
    activities: PaginatedActivities;
    filters?: { category?: string; search?: string };
    clinics?: Clinic[];
    totalCount?: number;
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(selectedCategory, search);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        applyFilters(category, search);
    };

    const applyFilters = (category: string, searchQuery: string) => {
        router.get(
            route('admin.activity.index'),
            {
                category: category || undefined,
                search: searchQuery || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedCategory('');
        router.get(route('admin.activity.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'users':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-[#0080FF] border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 gap-1 font-semibold text-xs py-1">
                        <Users className="h-3 w-3" />
                        Users & Staff
                    </Badge>
                );
            case 'appointments':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 gap-1 font-semibold text-xs py-1">
                        <Calendar className="h-3 w-3" />
                        Appointments
                    </Badge>
                );
            case 'prescriptions':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 gap-1 font-semibold text-xs py-1">
                        <Stethoscope className="h-3 w-3" />
                        Prescriptions
                    </Badge>
                );
            case 'clinics':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 gap-1 font-semibold text-xs py-1">
                        <Building2 className="h-3 w-3" />
                        Clinics
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-1 font-semibold text-xs py-1">
                        <Activity className="h-3 w-3" />
                        System
                    </Badge>
                );
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'doctor':
                return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">Doctor</span>;
            case 'patient':
                return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">Patient</span>;
            case 'clinic_admin':
                return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">Clinic Admin</span>;
            case 'super_admin':
                return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Super Admin</span>;
            default:
                return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">User</span>;
        }
    };

    const categories = [
        { key: '', label: 'All Activities', icon: Activity },
        { key: 'users', label: 'Users & Staff', icon: Users },
        { key: 'appointments', label: 'Appointments', icon: Calendar },
        { key: 'prescriptions', label: 'Prescriptions', icon: Stethoscope },
        { key: 'clinics', label: 'Clinics', icon: Building2 },
    ];

    return (
        <>
            <Head title="System Activity Log - Super Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard" className="text-slate-400 hover:text-[#0080FF] transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                System Activity Log
                            </h1>
                            <Badge className="bg-[#0080FF] text-white ml-2 text-xs">
                                {totalCount} Recorded
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Real-time audit trail of actions across all clinics, doctors, patients, and administrators.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="rounded-xl gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="h-4 w-4 text-slate-500" />
                            Reset Filters
                        </Button>
                        <Link href="/dashboard">
                            <Button size="sm" className="bg-[#0080FF] hover:bg-[#0070E0] text-white rounded-xl gap-1.5 font-semibold">
                                Dashboard Overview
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = selectedCategory === cat.key;
                                    return (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat.key)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                                isActive
                                                    ? 'bg-[#0080FF] text-white border-[#0080FF] shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0080FF]/60'
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[260px] md:w-80">
                                <div className="relative w-full">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Search activities, names, clinics..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-xs rounded-xl"
                                    />
                                </div>
                                <Button type="submit" size="sm" className="h-9 px-3 rounded-xl bg-[#0080FF] hover:bg-[#0070E0] text-white text-xs">
                                    Filter
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Activities Table Card */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#0080FF]" />
                                    Activity Stream
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Showing latest multi-tenant activities sorted chronologically
                                </CardDescription>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                Page {activities.current_page} of {activities.last_page || 1}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activities.data.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center mx-auto mb-3">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No activities found</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                    No system activities match the selected filter or search term. Try resetting your search filters.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="mt-4 rounded-xl text-xs"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200/80 dark:border-slate-800">
                                            <TableHead className="w-[160px] text-xs font-bold text-slate-600 dark:text-slate-400">Category</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Event / Action</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Actor / User</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Associated Clinic</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-400">Details</TableHead>
                                            <TableHead className="w-[140px] text-xs font-bold text-slate-600 dark:text-slate-400">Time</TableHead>
                                            <TableHead className="w-[110px] text-right text-xs font-bold text-slate-600 dark:text-slate-400">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activities.data.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800 transition-colors">
                                                <TableCell className="py-3.5">
                                                    {getCategoryBadge(item.category)}
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                                        {item.action}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                                            {item.user_name}
                                                        </span>
                                                        {getRoleBadge(item.user_role)}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                        <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="truncate max-w-[150px]">{item.clinic_name}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                                                        {item.details}
                                                    </p>
                                                </TableCell>

                                                <TableCell className="py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        <span>{item.time}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3.5 text-right">
                                                    <Link href={item.link}>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-2.5 text-xs font-semibold text-[#0080FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg gap-1 cursor-pointer"
                                                        >
                                                            <span>Inspect</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {activities.links && activities.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                <span className="text-xs text-slate-500">
                                    Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{activities.data.length}</span> of{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{activities.total}</span> activities
                                </span>
                                <div className="flex items-center gap-1">
                                    {activities.links.map((link, idx) => (
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

