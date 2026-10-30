'use client';

import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
    availabilities: Array<{
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_available: boolean;
    }>;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all shadow-xs',
                                    isCompleted
                                        ? 'bg-emerald-600 text-white'
                                        : isCurrent
                                        ? 'bg-[#0080FF] text-white ring-4 ring-blue-100 dark:ring-blue-950/60 shadow-md'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : step}
                            </div>
                            <span className={cn(
                                'text-xs font-semibold hidden sm:inline',
                                isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                            )}>
                                {step === 1 ? 'Doctor' : step === 2 ? 'Schedule' : 'Confirm'}
                            </span>
                        </div>

                        {step < totalSteps && (
                            <div
                                className={cn(
                                    'flex-1 h-0.5 mx-3 rounded-full',
                                    step < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function BookAppointment({ doctors }: { doctors: Doctor[] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        patient_notes: '',
    });

    const totalSteps = 3;

    // Step 1: Select Doctor
    const handleDoctorSelect = (doctorId: string) => {
        setData('doctor_id', doctorId);
        setSelectedDate('');
        setSelectedTime('');
        setAvailableSlots([]);
    };

    // Step 2: Calculate Slots with Timezone-Safe Parsing
    useEffect(() => {
        if (selectedDate && data.doctor_id) {
            const doctor = doctors.find((d) => d.id === parseInt(data.doctor_id));
            if (!doctor) return;

            const [year, month, day] = selectedDate.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const dayOfWeek = dateObj.getDay();

            const dayAvailabilities = doctor.availabilities.filter(
                (a) => a.day_of_week === dayOfWeek && a.is_available
            );

            const slots: string[] = [];
            dayAvailabilities.forEach((avail) => {
                const start = avail.start_time.slice(0, 5);
                const end = avail.end_time.slice(0, 5);
                let current = start;

                while (current < end) {
                    slots.push(current);
                    const [hours, minutes] = current.split(':').map(Number);
                    const nextMinutes = minutes + 30;
                    const nextHours = hours + Math.floor(nextMinutes / 60);
                    current = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`;
                }
            });

            setAvailableSlots(slots);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, data.doctor_id, doctors]);

    const handleSlotSelect = (slot: string) => {
        setSelectedTime(slot);
        setData('appointment_time', slot);
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setData('appointment_date', date);
        setSelectedTime('');
        setData('appointment_time', '');
    };

    const canProceed = () => {
        if (currentStep === 1) return !!data.doctor_id;
        if (currentStep === 2) return !!selectedDate && !!selectedTime;
        return true;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post(route('patient.appointments.store'));
    };

    const selectedDoctor = doctors.find((d) => d.id === parseInt(data.doctor_id));

    return (
        <>
            <Head title="Book Appointment — ClinicPro" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Book an Appointment
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Select a specialist doctor and pick an available time slot
                        </p>
                    </div>
                    <Link href={route('patient.appointments.index')}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <ArrowLeft className="h-4 w-4" /> Cancel Booking
                        </Button>
                    </Link>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                {/* Step 1: Select Doctor */}
                {currentStep === 1 && (
                    <Card className="border border-slate-200/90 dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Select a Doctor</CardTitle>
                            <CardDescription className="text-xs">
                                Choose an attending healthcare professional at your clinic
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {doctors.length === 0 ? (
                                <div className="text-center py-10 border border-dashed rounded-xl text-slate-400">
                                    <Stethoscope className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm font-medium">No doctors currently available at this clinic.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3.5 sm:grid-cols-2">
                                    {doctors.map((doc) => {
                                        const isSelected = data.doctor_id === doc.id.toString();

                                        return (
                                            <div
                                                key={doc.id}
                                                onClick={() => handleDoctorSelect(doc.id.toString())}
                                                className={cn(
                                                    'p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 relative flex items-start gap-3.5',
                                                    isSelected
                                                        ? 'border-[#0080FF] bg-[#EAF4FF]/50 dark:bg-blue-950/30 ring-2 ring-[#0080FF]/30 shadow-xs'
                                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                                    isSelected
                                                        ? 'bg-[#0080FF] text-white shadow-xs'
                                                        : 'bg-blue-50 dark:bg-blue-950/40 text-[#0080FF]'
                                                )}>
                                                    <Stethoscope className="h-5 w-5" />
                                                </div>

                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                                        {doc.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                        {doc.specialty || 'General Practice'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#0080FF] font-medium">
                                                        <span>{doc.availabilities.length} weekly shifts</span>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <CheckCircle2 className="h-5 w-5 text-[#0080FF] absolute top-4 right-4" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Select Date & Time */}
                {currentStep === 2 && (
                    <Card className="border border-slate-200/90 dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Pick Date & Time</CardTitle>
                            <CardDescription className="text-xs">
                                Consultation with <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDoctor?.name}</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="appointment_date" className="text-xs font-semibold">
                                        Appointment Date
                                    </Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={cn(
                                            'focus-visible:ring-[#0080FF]',
                                            errors.appointment_date && 'border-rose-500'
                                        )}
                                        disabled={processing}
                                        required
                                    />
                                    {errors.appointment_date && (
                                        <p className="text-xs text-rose-500">{errors.appointment_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">
                                        Available Time Slots
                                    </Label>

                                    {!selectedDate ? (
                                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                                            Please choose a date to display available doctor hours
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                                            <span>Doctor has no availability scheduled on this day. Please select another date.</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                            {availableSlots.map((slot) => {
                                                const isSlotSelected = selectedTime === slot;

                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => handleSlotSelect(slot)}
                                                        className={cn(
                                                            'py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center',
                                                            isSlotSelected
                                                                ? 'bg-[#0080FF] text-white border-[#0080FF] shadow-xs ring-2 ring-blue-200 dark:ring-blue-900'
                                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0080FF] hover:text-[#0080FF]'
                                                        )}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.appointment_time && (
                                        <p className="text-xs text-rose-500">{errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Confirm & Patient Notes */}
                {currentStep === 3 && (
                    <Card className="border border-slate-200/90 dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Review & Confirmation</CardTitle>
                            <CardDescription className="text-xs">
                                Confirm consultation details and add symptoms or visit reason
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* Summary Card */}
                            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0080FF] dark:text-[#38BDF8] mb-3 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4" /> Appointment Summary
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-slate-400">Doctor:</span>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedDoctor?.name}</p>
                                        <p className="text-slate-500">{selectedDoctor?.specialty || 'General Practice'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Date & Time:</span>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedDate}</p>
                                        <p className="text-[#0080FF] font-semibold">{selectedTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="patient_notes" className="text-xs font-semibold">
                                    Symptoms or Reason for Visit (Optional)
                                </Label>
                                <Textarea
                                    id="patient_notes"
                                    value={data.patient_notes}
                                    onChange={(e) => setData('patient_notes', e.target.value)}
                                    placeholder="Describe any symptoms, medical background, or questions for the doctor..."
                                    rows={4}
                                    className="focus-visible:ring-[#0080FF] resize-none text-xs"
                                />
                            </div>

                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                                <Info className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600" />
                                <p>
                                    Once submitted, your booking request will be placed in <strong>pending</strong> status for the clinic and attending doctor to review.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bottom Step Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                        disabled={currentStep === 1 || processing}
                        className="gap-1.5 text-xs"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>

                    {currentStep < totalSteps ? (
                        <Button
                            type="button"
                            onClick={() => setCurrentStep((s) => s + 1)}
                            disabled={!canProceed()}
                            className="bg-[#0080FF] hover:bg-[#0070E0] text-white gap-1.5 text-xs font-bold px-5"
                        >
                            Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={processing}
                            className="bg-[#0080FF] hover:bg-[#0070E0] text-white gap-1.5 text-xs font-bold px-6 shadow-sm"
                        >
                            {processing ? 'Confirming...' : 'Confirm & Book Appointment'}
                            <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
