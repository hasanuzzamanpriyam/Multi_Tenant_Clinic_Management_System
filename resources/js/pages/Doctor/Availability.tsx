'use client';

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
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
  CheckCircle,
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
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true,
    });

    const dayOptions = dayNames.map((name, index) => ({ value: index, label: name }));

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
        if (confirm('Are you sure you want to delete this availability?')) {
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
            <Head title="Manage Availability" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Availability</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Set your weekly schedule for patient appointments</p>
                    </div>
                    <Button onClick={() => { setData('day_of_week', ''); setData('start_time', ''); setData('end_time', ''); setData('is_available', true); setEditingId(null); setIsCreating(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Availability
                    </Button>
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingId) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingId ? 'Edit Availability' : 'Add New Availability'}</CardTitle>
                            <CardDescription>Set the day and time range for your availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="day_of_week">Day of Week</Label>
                                        <select
                                            id="day_of_week"
                                            value={data.day_of_week}
                                            onChange={(e) => setData('day_of_week', e.target.value)}
                                            className={cn(
                                                'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:placeholder:text-gray-400',
                                                errors.day_of_week && 'border-red-500 focus-visible:ring-red-500'
                                            )}
                                            disabled={processing}
                                            required
                                        >
                                            <option value="">Select day</option>
                                            {dayNames.map((name, index) => (
                                                <option key={index} value={index}>{name}</option>
                                            ))}
                                        </select>
                                        {errors.day_of_week && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.day_of_week}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className={errors.start_time ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.start_time && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">End Time</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className={errors.end_time ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.end_time && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.end_time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_available">Available</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="is_available"
                                            name="is_available"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                            checked={data.is_available}
                                            onChange={(e) => setData('is_available', e.target.checked)}
                                        />
                                        <Label htmlFor="is_available" className="text-sm text-gray-900 dark:text-gray-100">
                                            Available for appointments
                                        </Label>
                                    </div>
                                </div>

                                {hasOverlap(
                                    parseInt(data.day_of_week),
                                    data.start_time,
                                    data.end_time,
                                    editingId
                                ) && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            This time overlaps with an existing availability slot.
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); setIsCreating(false); }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Availabilities List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Schedule</CardTitle>
                        <CardDescription>Your current availability slots</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {availabilities.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No availability set</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Add your first availability slot to start accepting appointments</p>
                                <Button onClick={() => { setData('day_of_week', ''); setData('start_time', ''); setData('end_time', ''); setData('is_available', true); setEditingId(null); setIsCreating(true); }} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Availability
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dayNames.map((dayName, dayIndex) => {
                                    const dayAvailabilities = availabilities.filter(a => a.day_of_week === dayIndex);
                                    if (dayAvailabilities.length === 0) return null;

                                    return (
                                        <div key={dayIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="font-medium text-gray-900 dark:text-white capitalize">{dayName}</h4>
                                            </div>
                                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {dayAvailabilities.map((avail) => (
                                                    <div key={avail.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    'px-3 py-1 rounded-full text-sm font-medium',
                                                                    avail.is_available
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                )}>
                                                                    {avail.is_available ? 'Available' : 'Unavailable'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                                    <span>{avail.start_time.slice(0, 5)} - {avail.end_time.slice(0, 5)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(avail)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" variant="destructive" onClick={() => handleDelete(avail.id)}>
                                                                <Trash2 className="h-4 w-4" />
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