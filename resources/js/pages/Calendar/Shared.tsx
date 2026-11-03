'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';

// FullCalendar v7 required stylesheets
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import {
    Calendar as CalendarIcon,
    CalendarDays,
    Clock,
    Plus,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    Users,
    User,
    X,
    Filter,
    CalendarClock,
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DoctorOption {
    id: number;
    name: string;
    specialty?: string | null;
}

interface CalendarAppointment {
    id: number;
    title: string;
    start: string;
    status: string;
    priority?: string | null;
    patient?: string | null;
    doctor?: string | null;
    doctor_id?: number | null;
    patient_id?: number | null;
    appointment_date?: string | null;
    appointment_time?: string | null;
    patient_notes?: string | null;
    doctor_notes?: string | null;
    url?: string | null;
}

interface CalendarPageProps {
    doctors?: DoctorOption[];
}

export default function CalendarPage({ doctors = [] }: CalendarPageProps) {
    const calendarRef = useRef<any>(null);
    const { auth } = usePage().props as {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                role: string;
                tenant_id?: number | null;
                clinic?: { id: number; name: string } | null;
            };
        };
    };

    const user = auth?.user;
    const isSuperAdmin = user?.role === 'super_admin';
    const isClinicAdmin = user?.role === 'clinic_admin';
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';

    const [events, setEvents] = useState<CalendarAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<CalendarAppointment | null>(null);

    // Sidebar Form State
    const [submittingRecurring, setSubmittingRecurring] = useState(false);
    const [submittingWaitlist, setSubmittingWaitlist] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [recurrenceType, setRecurrenceType] = useState('weekly');
    const [endDate, setEndDate] = useState('');
    const [waitlistDoctor, setWaitlistDoctor] = useState('');
    const [waitlistDate, setWaitlistDate] = useState('');
    const [waitlistTime, setWaitlistTime] = useState('');

    const fetchEvents = () => {
        setLoading(true);
        const url = route('calendar.events');
        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error('Failed to load events');
                return r.json();
            })
            .then((data) => {
                setEvents(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load calendar events. Please try again.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events by doctor & status
    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const matchesDoctor =
                selectedDoctorId === 'all' ||
                (e.doctor_id && String(e.doctor_id) === String(selectedDoctorId));

            const matchesStatus =
                statusFilter === 'all' ||
                (e.status && e.status.toLowerCase() === statusFilter.toLowerCase());

            return matchesDoctor && matchesStatus;
        });
    }, [events, selectedDoctorId, statusFilter]);

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    bg: '#059669',
                    border: '#10b981',
                    text: '#ffffff',
                    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    dot: 'bg-emerald-400',
                    label: 'Completed',
                };
            case 'approved':
            case 'confirmed':
                return {
                    bg: '#0284c7',
                    border: '#38bdf8',
                    text: '#ffffff',
                    badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                    dot: 'bg-sky-400',
                    label: 'Confirmed',
                };
            case 'pending':
                return {
                    bg: '#d97706',
                    border: '#f59e0b',
                    text: '#ffffff',
                    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                    dot: 'bg-amber-400',
                    label: 'Pending',
                };
            case 'cancelled':
                return {
                    bg: '#dc2626',
                    border: '#f87171',
                    text: '#ffffff',
                    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                    dot: 'bg-rose-400',
                    label: 'Cancelled',
                };
            default:
                return {
                    bg: '#475569',
                    border: '#64748b',
                    text: '#ffffff',
                    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                    dot: 'bg-slate-400',
                    label: status || 'Unknown',
                };
        }
    };

    const formatEventTime = (dateTimeStr?: string | null) => {
        if (!dateTimeStr) return '';
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch {
            return '';
        }
    };

    const formatFullDate = (dateTimeStr?: string | null) => {
        if (!dateTimeStr) return '';
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) return dateTimeStr;
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateTimeStr;
        }
    };

    const handleSubmitRecurring = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRecurring(true);
        setActionMessage(null);
        try {
            const res = await fetch(route('calendar.recurring.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    day_of_week: dayOfWeek,
                    start_time: startTime,
                    end_time: endTime,
                    recurrence_type: recurrenceType,
                    end_date: endDate || undefined,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to create recurring availability');
            }

            setActionMessage({ type: 'success', text: 'Recurring consultation hours saved successfully.' });
            setDayOfWeek(1);
            setStartTime('09:00');
            setEndTime('17:00');
            setEndDate('');
        } catch (err: any) {
            setActionMessage({ type: 'error', text: err.message || 'Failed to create recurring availability.' });
        } finally {
            setSubmittingRecurring(false);
        }
    };

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistDoctor) {
            setActionMessage({ type: 'error', text: 'Please select a doctor.' });
            return;
        }
        setSubmittingWaitlist(true);
        setActionMessage(null);
        try {
            const res = await fetch(route('calendar.waitlist.join'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    doctor_id: waitlistDoctor,
                    appointment_date: waitlistDate,
                    preferred_time: waitlistTime || undefined,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to register for waitlist');
            }

            setActionMessage({ type: 'success', text: 'Patient registered to waitlist successfully.' });
            setWaitlistDoctor('');
            setWaitlistDate('');
            setWaitlistTime('');
        } catch (err: any) {
            setActionMessage({ type: 'error', text: err.message || 'Failed to join waitlist.' });
        } finally {
            setSubmittingWaitlist(false);
        }
    };

    return (
        <>
            <Head title="Appointment Calendar" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-[#0080FF]/10 text-[#0080FF] dark:bg-blue-950/40 dark:text-[#38BDF8] shadow-2xs">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Appointment Calendar
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isSuperAdmin && 'System-wide schedule & appointment monitoring across all clinics.'}
                                    {isClinicAdmin && `Clinic schedule & doctor consultations for ${user?.clinic?.name || 'your clinic'}.`}
                                    {isDoctor && 'Your upcoming consultation timeline, patient visits, and clinic slots.'}
                                    {isPatient && 'Track your booked healthcare appointments and doctor visits.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isPatient ? (
                            <Link href="/patient/appointments/create">
                                <Button className="bg-[#0080FF] hover:bg-[#006ee0] text-white shadow-xs rounded-xl">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Book Appointment
                                </Button>
                            </Link>
                        ) : isClinicAdmin ? (
                            <Link href="/clinic-admin/appointments">
                                <Button variant="outline" className="border-slate-200 dark:border-slate-800 rounded-xl">
                                    <CalendarDays className="w-4 h-4 mr-1.5 text-[#0080FF]" />
                                    Manage Appointments
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </div>

                {/* Status Badges Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#111726]/70 border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px] mr-1">
                            Status:
                        </span>
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'confirmed' ? 'all' : 'confirmed')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all',
                                statusFilter === 'confirmed'
                                    ? 'bg-sky-500 text-white shadow-xs'
                                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 hover:bg-sky-500/20'
                            )}
                        >
                            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'confirmed' ? 'bg-white' : 'bg-sky-500')} />
                            Confirmed ({events.filter((e) => e.status?.toLowerCase() === 'confirmed' || e.status?.toLowerCase() === 'approved').length})
                        </button>

                        <button
                            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all',
                                statusFilter === 'completed'
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-500/20'
                            )}
                        >
                            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'completed' ? 'bg-white' : 'bg-emerald-500')} />
                            Completed ({events.filter((e) => e.status?.toLowerCase() === 'completed').length})
                        </button>

                        <button
                            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all',
                                statusFilter === 'pending'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-500/20'
                            )}
                        >
                            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'pending' ? 'bg-white' : 'bg-amber-500')} />
                            Pending ({events.filter((e) => e.status?.toLowerCase() === 'pending').length})
                        </button>

                        <button
                            onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all',
                                statusFilter === 'cancelled'
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-500/20'
                            )}
                        >
                            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'cancelled' ? 'bg-white' : 'bg-rose-500')} />
                            Cancelled ({events.filter((e) => e.status?.toLowerCase() === 'cancelled').length})
                        </button>

                        {statusFilter !== 'all' && (
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="text-xs text-[#0080FF] hover:underline font-semibold ml-1"
                            >
                                Clear status filter
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Showing <strong className="text-slate-800 dark:text-slate-200">{filteredEvents.length}</strong> of {events.length} appointments
                    </div>
                </div>

                {/* Notifications & Flash Feedback */}
                {actionMessage && (
                    <div
                        className={cn(
                            'p-4 rounded-2xl border flex items-center justify-between transition-all shadow-xs',
                            actionMessage.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {actionMessage.type === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                            )}
                            <p className="text-sm font-medium">{actionMessage.text}</p>
                        </div>
                        <button
                            onClick={() => setActionMessage(null)}
                            className="text-xs font-semibold underline opacity-80 hover:opacity-100"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center gap-2.5 shadow-xs">
                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 rounded-2xl bg-white dark:bg-[#111726]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-[#0080FF]/10 flex items-center justify-center animate-pulse">
                                <CalendarIcon className="w-7 h-7 text-[#0080FF]" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-4">
                            Loading calendar schedule...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* ======================================================== */}
                        {/* MAIN CALENDAR SCHEDULE SECTION                          */}
                        {/* ======================================================== */}
                        <div className={cn(isSuperAdmin || isClinicAdmin ? 'lg:col-span-8' : 'lg:col-span-12')}>
                            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] rounded-2xl shadow-sm overflow-hidden">
                                {/* Calendar Header Bar with Doctor Filter */}
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4 px-6 pt-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Calendar Schedule
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                                >
                                                    {filteredEvents.length} {filteredEvents.length === 1 ? 'appointment' : 'appointments'}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Interactive schedule view. Click any appointment card to view patient and consultation details.
                                            </CardDescription>
                                        </div>

                                        {/* Filter By Doctor Dropdown */}
                                        {doctors.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    <Filter className="w-3.5 h-3.5 text-[#0080FF]" />
                                                    <span className="hidden sm:inline">Doctor:</span>
                                                </div>
                                                <select
                                                    value={selectedDoctorId}
                                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                                    className="h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e1422] px-3 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-[#0080FF] focus:outline-hidden transition-colors"
                                                >
                                                    <option value="all">All Doctors ({doctors.length})</option>
                                                    {doctors.map((doc) => (
                                                        <option key={doc.id} value={doc.id}>
                                                            {doc.name} {doc.specialty ? `• ${doc.specialty}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                {/* FullCalendar Wrapper */}
                                <CardContent className="p-4 sm:p-6 modern-calendar-container">
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[classicThemePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                        }}
                                        events={filteredEvents.map((apt) => {
                                            const style = getStatusStyle(apt.status);
                                            return {
                                                id: String(apt.id),
                                                title: apt.patient || apt.title,
                                                start: apt.start,
                                                backgroundColor: style.bg,
                                                borderColor: style.border,
                                                textColor: style.text,
                                                extendedProps: {
                                                    ...apt,
                                                    style,
                                                },
                                            };
                                        })}
                                        eventContent={(eventInfo) => {
                                            const apt = eventInfo.event.extendedProps as CalendarAppointment & {
                                                style: ReturnType<typeof getStatusStyle>;
                                            };
                                            const timeString = formatEventTime(apt.start || apt.appointment_time);
                                            const priority = apt.priority;

                                            return (
                                                <div
                                                    style={{ backgroundColor: apt.style?.bg || '#0284c7' }}
                                                    className="flex flex-col gap-0.5 w-full overflow-hidden px-2 py-1 rounded-lg text-left leading-tight group shadow-xs border border-white/10"
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                                                            {eventInfo.event.title}
                                                        </span>
                                                        {priority && priority !== 'normal' && (
                                                            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-red-500/90 text-white rounded shrink-0">
                                                                {priority.substring(0, 3)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[10px] text-white/90 font-medium truncate">
                                                        <span>{timeString}</span>
                                                        {apt.doctor && (
                                                            <span className="text-white/75 truncate ml-1 text-[9.5px]">
                                                                {apt.doctor.replace('Dr. ', '')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                        eventClick={(info) => {
                                            info.jsEvent.preventDefault();
                                            const apt = filteredEvents.find((e) => String(e.id) === String(info.event.id));
                                            if (apt) {
                                                setSelectedEvent(apt);
                                            }
                                        }}
                                        dayMaxEvents={3}
                                        moreLinkText={(num) => `+${num} more`}
                                        slotMinTime="07:00:00"
                                        slotMaxTime="21:00:00"
                                        allDaySlot={false}
                                        height="auto"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* ======================================================== */}
                        {/* SIDEBAR FORMS: AVAILABILITY & WAITLIST                   */}
                        {/* ======================================================== */}
                        {(isSuperAdmin || isClinicAdmin) && (
                            <div className="lg:col-span-4 space-y-6">
                                {/* Recurring Availability Card */}
                                <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] rounded-2xl shadow-sm">
                                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 px-5 pt-4">
                                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-[#0080FF]/10 text-[#0080FF] dark:bg-blue-950/40 dark:text-[#38BDF8]">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span>Recurring Availability</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                            Setup weekly repeating clinic consultation hours
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <form className="space-y-3.5" onSubmit={handleSubmitRecurring}>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Day of Week
                                                </label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                    value={dayOfWeek}
                                                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                                                >
                                                    <option value="1">Monday</option>
                                                    <option value="2">Tuesday</option>
                                                    <option value="3">Wednesday</option>
                                                    <option value="4">Thursday</option>
                                                    <option value="5">Friday</option>
                                                    <option value="6">Saturday</option>
                                                    <option value="0">Sunday</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Start Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        End Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={endTime}
                                                        onChange={(e) => setEndTime(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Recurrence
                                                    </label>
                                                    <select
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={recurrenceType}
                                                        onChange={(e) => setRecurrenceType(e.target.value)}
                                                    >
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        End Date (Optional)
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={submittingRecurring}
                                                className="w-full bg-[#0080FF] hover:bg-[#006ee0] text-white text-xs font-semibold rounded-xl h-9 mt-2 shadow-2xs"
                                            >
                                                {submittingRecurring ? 'Saving...' : 'Save Availability'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Appointment Waitlist Card */}
                                <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] rounded-2xl shadow-sm">
                                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 px-5 pt-4">
                                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span>Add to Waitlist</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                            Queue patients for busy doctor schedules
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <form className="space-y-3.5" onSubmit={handleJoinWaitlist}>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Assigned Doctor
                                                </label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                    value={waitlistDoctor}
                                                    onChange={(e) => setWaitlistDoctor(e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Choose a doctor --</option>
                                                    {doctors.map((d) => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.name} {d.specialty ? `(${d.specialty})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Requested Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={waitlistDate}
                                                        onChange={(e) => setWaitlistDate(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Preferred Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1422] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-[#0080FF] focus:outline-hidden"
                                                        value={waitlistTime}
                                                        onChange={(e) => setWaitlistTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={submittingWaitlist}
                                                variant="outline"
                                                className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl h-9 mt-2"
                                            >
                                                {submittingWaitlist ? 'Enrolling...' : 'Join Patient Waitlist'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* EVENT DETAIL POPUP MODAL                                 */}
            {/* ======================================================== */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getStatusStyle(selectedEvent.status).bg }}
                                />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Appointment Details
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', getStatusStyle(selectedEvent.status).badgeBg)}
                                >
                                    {selectedEvent.status}
                                </Badge>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Patient & Doctor Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/70 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                                        <User className="w-3.5 h-3.5 text-[#0080FF]" />
                                        <span>Patient</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {selectedEvent.patient || 'Unknown Patient'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/70 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                                        <Stethoscope className="w-3.5 h-3.5 text-[#0080FF]" />
                                        <span>Assigned Doctor</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {selectedEvent.doctor || 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            {/* Date, Time & Priority */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                        <CalendarIcon className="w-3.5 h-3.5" /> Date:
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {formatFullDate(selectedEvent.start || selectedEvent.appointment_date)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                        <Clock className="w-3.5 h-3.5" /> Time:
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {formatEventTime(selectedEvent.start || selectedEvent.appointment_time) || selectedEvent.appointment_time || 'Scheduled'}
                                    </span>
                                </div>

                                {selectedEvent.priority && selectedEvent.priority !== 'normal' && (
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> Priority:
                                        </span>
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-orange-500/10 text-orange-400 border-orange-500/30">
                                            {selectedEvent.priority}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {(selectedEvent.patient_notes || selectedEvent.doctor_notes) && (
                                <div className="space-y-2 text-xs">
                                    {selectedEvent.patient_notes && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/70 dark:border-slate-800">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Patient Notes
                                            </span>
                                            <p className="text-slate-700 dark:text-slate-300 italic">
                                                "{selectedEvent.patient_notes}"
                                            </p>
                                        </div>
                                    )}

                                    {selectedEvent.doctor_notes && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200/70 dark:border-slate-800">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Clinical Notes
                                            </span>
                                            <p className="text-slate-700 dark:text-slate-300">
                                                {selectedEvent.doctor_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3">
                            {selectedEvent.url ? (
                                <Link href={selectedEvent.url} className="w-full">
                                    <Button className="w-full bg-[#0080FF] hover:bg-[#006ee0] text-white rounded-xl shadow-xs text-xs font-semibold">
                                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                        Open Appointment Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <div />
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setSelectedEvent(null)}
                                className="rounded-xl border-slate-300 dark:border-slate-700 text-xs"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* TAILWIND & THEME SCOPED STYLES FOR FULLCALENDAR         */}
            {/* ======================================================== */}
            <style>{`
                /* Container & Overall Calendar */
                .modern-calendar-container {
                    --fc-border-color: #e2e8f0;
                    --fc-today-bg-color: rgba(0, 128, 255, 0.05);
                }

                .dark .modern-calendar-container {
                    --fc-border-color: rgba(51, 65, 85, 0.45);
                    --fc-today-bg-color: rgba(0, 128, 255, 0.1);
                    --fc-page-bg-color: transparent;
                    --fc-neutral-bg-color: transparent;
                }

                /* Header Toolbar */
                .modern-calendar-container .fc-toolbar {
                    margin-bottom: 1.25rem !important;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .modern-calendar-container .fc-toolbar-title {
                    font-size: 1.15rem !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.01em;
                    color: #0f172a;
                }

                .dark .modern-calendar-container .fc-toolbar-title {
                    color: #f8fafc !important;
                }

                /* Toolbar Buttons */
                .modern-calendar-container .fc-button {
                    background-color: #f8fafc !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #334155 !important;
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    padding: 0.4rem 0.85rem !important;
                    border-radius: 0.75rem !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
                    transition: all 0.15s ease;
                    text-transform: capitalize !important;
                }

                .dark .modern-calendar-container .fc-button {
                    background-color: #0e1422 !important;
                    border-color: #1e293b !important;
                    color: #cbd5e1 !important;
                }

                .modern-calendar-container .fc-button:hover {
                    background-color: #e2e8f0 !important;
                    color: #0f172a !important;
                    border-color: #94a3b8 !important;
                }

                .dark .modern-calendar-container .fc-button:hover {
                    background-color: #1e293b !important;
                    color: #ffffff !important;
                    border-color: #334155 !important;
                }

                .modern-calendar-container .fc-button-active,
                .modern-calendar-container .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: #0080FF !important;
                    border-color: #0080FF !important;
                    color: #ffffff !important;
                    box-shadow: 0 2px 4px rgba(0, 128, 255, 0.25) !important;
                }

                .modern-calendar-container .fc-button-group {
                    gap: 0.25rem;
                }

                .modern-calendar-container .fc-button-group > .fc-button {
                    border-radius: 0.65rem !important;
                }

                /* Days of Week Header Cells */
                .modern-calendar-container .fc-col-header-cell {
                    padding: 0.65rem 0 !important;
                    background-color: rgba(248, 250, 252, 0.8);
                    border-color: var(--fc-border-color) !important;
                }

                .dark .modern-calendar-container .fc-col-header-cell {
                    background-color: rgba(14, 20, 34, 0.7);
                    border-color: var(--fc-border-color) !important;
                }

                .modern-calendar-container .fc-col-header-cell-cushion {
                    font-size: 0.72rem !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.06em;
                    color: #64748b !important;
                    text-decoration: none !important;
                }

                .dark .modern-calendar-container .fc-col-header-cell-cushion {
                    color: #94a3b8 !important;
                }

                /* Grid Day Numbers */
                .modern-calendar-container .fc-daygrid-day-number {
                    font-size: 0.78rem !important;
                    font-weight: 700 !important;
                    color: #475569;
                    padding: 0.4rem 0.55rem !important;
                    text-decoration: none !important;
                }

                .dark .modern-calendar-container .fc-daygrid-day-number {
                    color: #94a3b8;
                }

                .modern-calendar-container .fc-daygrid-day:hover .fc-daygrid-day-number {
                    color: #0080FF;
                }

                /* Today Highlight */
                .modern-calendar-container .fc-day-today {
                    background-color: var(--fc-today-bg-color) !important;
                }

                .modern-calendar-container .fc-day-today .fc-daygrid-day-number {
                    color: #0080FF !important;
                    font-weight: 800 !important;
                }

                /* Event Cards */
                .modern-calendar-container .fc-event {
                    border: none !important;
                    border-radius: 0.55rem !important;
                    margin: 1.5px 3px !important;
                    cursor: pointer !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
                    transition: transform 0.12s ease, filter 0.12s ease;
                }

                .modern-calendar-container .fc-event:hover {
                    filter: brightness(1.12);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.18);
                }

                .modern-calendar-container .fc-daygrid-more-link {
                    font-size: 0.7rem !important;
                    font-weight: 700 !important;
                    color: #0080FF !important;
                    padding: 2px 4px !important;
                    border-radius: 0.35rem;
                }

                .modern-calendar-container .fc-daygrid-more-link:hover {
                    background-color: rgba(0, 128, 255, 0.1);
                    text-decoration: none !important;
                }

                /* Table Borders */
                .modern-calendar-container table {
                    border-color: var(--fc-border-color) !important;
                }

                .modern-calendar-container td,
                .modern-calendar-container th {
                    border-color: var(--fc-border-color) !important;
                }
            `}</style>
        </>
    );
}
