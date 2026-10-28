'use client';

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronRight,
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

interface StepProps {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    canProceed: boolean;
    nextLabel?: string;
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-between mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                    <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors',
                        step < currentStep
                            ? 'bg-green-500 text-white'
                            : step === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    )}>
                        {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                    </div>
                    {step < totalSteps && (
                        <div className={cn(
                            'flex-1 h-1 mx-2',
                            step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        )} />
                    )}
                </div>
            ))}
        </div>
    );
}

function StepNavigation({ currentStep, totalSteps, onNext, onBack, canProceed, nextLabel = 'Continue' }: StepProps) {
    return (
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1}
                className="hidden sm:block"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className="flex items-center gap-3 sm:ml-auto">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 1}
                    className="sm:hidden"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="sm:hidden"
                >
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="hidden sm:block"
                >
                    {nextLabel}
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
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

    // Step 2: Select Date & Time
    useEffect(() => {
        if (selectedDate && data.doctor_id) {
            const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));
            if (!doctor) return;

            const dayOfWeek = new Date(selectedDate).getDay();
            const dayAvailabilities = doctor.availabilities.filter(
                a => a.day_of_week === new Date(selectedDate).getDay() && a.is_available
            );

            const slots: string[] = [];
            dayAvailabilities.forEach(avail => {
                const start = avail.start_time.slice(0, 5);
                const end = avail.end_time.slice(0, 5);
                let current = start;
                while (current < end) {
                    slots.push(current);
                    const [hours, minutes] = current.split(':').map(Number);
                    let nextMinutes = minutes + 30;
                    let nextHours = hours;
                    if (nextMinutes >= 60) {
                        nextHours += 1;
                        nextMinutes -= 60;
                    }
                    current = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
                    if (current >= end) break;
                }
            });
            setAvailableSlots(slots);
            setSelectedTime('');
        }
    }, [selectedDate, data.doctor_id]);

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return !!data.doctor_id;
            case 2:
                return !!selectedDate && !!selectedTime;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                setData('doctor_id', '');
                setData('appointment_date', '');
                setData('appointment_time', '');
                setData('patient_notes', '');
                setCurrentStep(1);
                setSelectedDate('');
                setSelectedTime('');
            },
        });
    };

    const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));

    return (
        <>
            <Head title="Book Appointment" />
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule your appointment in 3 easy steps</p>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                {/* Step 1: Select Doctor */}
                {currentStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Select Doctor</CardTitle>
                            <CardDescription>Choose a doctor from your clinic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {doctors.map((doc) => (
                                    <Button
                                        key={doc.id}
                                        variant={data.doctor_id === doc.id.toString() ? 'default' : 'outline'}
                                        className={cn(
                                            'w-full h-32 flex flex-col items-start justify-center gap-2 text-left',
                                            data.doctor_id === doc.id.toString()
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                        )}
                                        onClick={() => handleDoctorSelect(doc.id.toString())}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.specialty || 'General Practice'}</p>
                                            </div>
                                        </div>
                                        {data.doctor_id === doc.id.toString() && (
                                            <CheckCircle className="h-5 w-5 text-blue-500" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Select Date & Time */}
                {currentStep === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Select Date & Time</CardTitle>
                            <CardDescription>Choose an available time slot with {doctor?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_date">Appointment Date</Label>
                                        <Input
                                            id="appointment_date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={errors.appointment_date ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={processing}
                                            required
                                        />
                                        {errors.appointment_date && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.appointment_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment_time">Appointment Time</Label>
                                        <Select
                                            value={selectedTime}
                                            onValueChange={setSelectedTime}
                                            disabled={!selectedDate || availableSlots.length === 0 || processing}
                                        >
                                            <SelectTrigger className={cn(
                                                availableSlots.length === 0 && 'bg-gray-50 dark:bg-gray-800',
                                                errors.appointment_time && 'border-red-500 focus-visible:ring-red-500'
                                            )}>
                                                <SelectValue placeholder={availableSlots.length === 0
                                                    ? 'Select a date first'
                                                    : 'Select time'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSlots.length === 0 ? (
                                                    <SelectItem value="" disabled>
                                                        No available slots for this date
                                                    </SelectItem>
                                                ) : (
                                                    availableSlots.map((slot) => {
                                                        return (
                                                            <SelectItem key={slot} value={slot}>
                                                                {slot}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.appointment_time && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.appointment_time}</p>
                                        )}
                                        {availableSlots.length === 0 && selectedDate && (
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                                No available slots for this date. Please choose another date.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            Selected Appointment
                                        </h4>
                                        {selectedDate && selectedTime ? (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-gray-500" />
                                                    <span className="text-gray-900 dark:text-white">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-gray-500" />
                                                    <span className="text-gray-900 dark:text-white font-medium">{selectedTime}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Select a date and time to see your appointment details</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Confirm & Notes */}
                {currentStep === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3: Confirm & Notes</CardTitle>
                            <CardDescription>Review your appointment and add any notes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Appointment Summary
                                </h4>
                                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Doctor</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{doctor?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Specialty</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{doctor?.specialty || 'General Practice'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 dark:text-gray-400">Time</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{selectedTime}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="patient_notes"
                                        value={data.patient_notes}
                                        onChange={(e) => setData('patient_notes', e.target.value)}
                                        placeholder="Any symptoms, concerns, or information for the doctor..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                Your appointment will be <strong>pending approval</strong> by the clinic admin.
                                                You will receive a notification once it's confirmed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing}>
                                {processing ? 'Booking...' : 'Book Appointment'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Navigation */}
                <StepNavigation
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={() => setCurrentStep(s => s + 1)}
                    onBack={() => setCurrentStep(s => s - 1)}
                    canProceed={canProceed()}
                    nextLabel={currentStep === 3 ? 'Book Appointment' : 'Continue'}
                />
            </div>
        </>
    );
}