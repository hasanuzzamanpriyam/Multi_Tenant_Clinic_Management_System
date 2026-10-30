'use client';

import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Availability {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability({ availabilities }: { availabilities: Availability[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('doctor.availability.update', editingId), {
                onSuccess: () => {
                    setEditingId(null);
                    setIsCreating(false);
                },
            });
        } else {
            post(route('doctor.availability.store'), {
                onSuccess: () => {
                    setData('day_of_week', '');
                    setData('start_time', '');
                    setData('end_time', '');
                    setIsCreating(false);
                },
            });
        }
    };

    const handleEdit = (avail: Availability) => {
        setData({
            day_of_week: avail.day_of_week.toString(),
            start_time: avail.start_time.slice(0, 5),
            end_time: avail.end_time.slice(0, 5),
            is_available: avail.is_available,
        });
        setEditingId(avail.id);
        setIsCreating(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this availability slot?')) {
            destroy(route('doctor.availability.destroy', id));
        }
    };

    const hasOverlap = (day: number, start: string, end: string, excludeId?: number) => {
        return availabilities.some(a =>
            a.id !== excludeId &&
            a.day_of_week === day &&
            a.is_available &&
            ((a.start_time < end && a.end_time > start))
        );
    };

    return (
        <>
            <Head title="Weekly Availability — ClinicPro" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Weekly Availability
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Configure your consultation schedule for patient bookings
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setData('day_of_week', '');
                            setData('start_time', '');
                            setData('end_time', '');
                            setData('is_available', true);
                            setEditingId(null);
                            setIsCreating(true);
                        }}
                        className="bg-[#0080FF] hover:bg-[#0070E0] text-white gap-2 font-bold shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Time Slot
                    </Button>
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingId) && (
                    <Card className="border border-[#0080FF]/30 dark:border-blue-900 shadow-md">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Edit Availability Slot' : 'Add New Consultation Slot'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Define the weekday and recurring hours for patient visits
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-5">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="day_of_week" className="text-xs font-semibold">
                                            Day of Week
                                        </Label>
                                        <select
                                            id="day_of_week"
                                            value={data.day_of_week}
                                            onChange={(e) => setData('day_of_week', e.target.value)}
                                            className={cn(
                                                'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0080FF]',
                                                errors.day_of_week && 'border-rose-500'
                                            )}
                                            disabled={processing}
                                            required
                                        >
                                            <option value="">Select weekday</option>
                                            {dayNames.map((name, index) => (
                                                <option key={index} value={index}>{name}</option>
                                            ))}
                                        </select>
                                        {errors.day_of_week && (
                                            <p className="text-xs text-rose-500">{errors.day_of_week}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="start_time" className="text-xs font-semibold">
                                            Start Time
                                        </Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className={cn('focus-visible:ring-[#0080FF]', errors.start_time && 'border-rose-500')}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.start_time && (
                                            <p className="text-xs text-rose-500">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="end_time" className="text-xs font-semibold">
                                            End Time
                                        </Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className={cn('focus-visible:ring-[#0080FF]', errors.end_time && 'border-rose-500')}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.end_time && (
                                            <p className="text-xs text-rose-500">{errors.end_time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        id="is_available"
                                        name="is_available"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-[#0080FF] focus:ring-[#0080FF]"
                                        checked={data.is_available}
                                        onChange={(e) => setData('is_available', e.target.checked)}
                                    />
                                    <Label htmlFor="is_available" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Active for online patient booking
                                    </Label>
                                </div>

                                {data.day_of_week !== '' && data.start_time && data.end_time && hasOverlap(
                                    parseInt(data.day_of_week),
                                    data.start_time,
                                    data.end_time,
                                    editingId || undefined
                                ) && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                                        <span>Warning: This slot overlaps with an existing schedule for this day.</span>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setEditingId(null); setIsCreating(false); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="bg-[#0080FF] hover:bg-[#0070E0] text-white font-bold"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : (editingId ? 'Update Slot' : 'Save Slot')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Availabilities by Weekday */}
                <Card className="border border-slate-200/90 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Configured Shifts</CardTitle>
                                <CardDescription className="text-xs">
                                    Recurring weekly shifts automatically open booking slots
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs text-[#0080FF] border-blue-200">
                                {availabilities.length} active slots
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {availabilities.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No schedule set yet</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Add your weekly hours so patients can book visits.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dayNames.map((dayName, dayIndex) => {
                                    const dayAvailabilities = availabilities.filter((a) => a.day_of_week === dayIndex);
                                    if (dayAvailabilities.length === 0) return null;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs"
                                        >
                                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                                    {dayName}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    {dayAvailabilities.length} {dayAvailabilities.length === 1 ? 'shift' : 'shifts'}
                                                </span>
                                            </div>

                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {dayAvailabilities.map((avail) => (
                                                    <div
                                                        key={avail.id}
                                                        className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0080FF] flex items-center justify-center shrink-0">
                                                                <Clock className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                                    {avail.start_time.slice(0, 5)} — {avail.end_time.slice(0, 5)}
                                                                </p>
                                                                <span
                                                                    className={cn(
                                                                        'inline-block text-[10px] font-semibold mt-0.5',
                                                                        avail.is_available
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : 'text-slate-400'
                                                                    )}
                                                                >
                                                                    {avail.is_available ? '● Active' : '○ Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-slate-500 hover:text-[#0080FF]"
                                                                onClick={() => handleEdit(avail)}
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                                                                onClick={() => handleDelete(avail.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
