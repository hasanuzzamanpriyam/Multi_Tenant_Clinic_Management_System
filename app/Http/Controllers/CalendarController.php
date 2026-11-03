<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentWaitlist;
use App\Models\RecurringAppointment;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $doctors = [];

        if ($user->role === 'clinic_admin') {
            $doctors = UserModel::where('role', 'doctor')
                ->where('tenant_id', $user->tenant_id)
                ->select('id', 'name', 'specialty')
                ->get();
        } elseif ($user->role === 'super_admin') {
            $doctors = UserModel::where('role', 'doctor')
                ->select('id', 'name', 'specialty')
                ->get();
        }

        return inertia('Calendar/Shared', [
            'doctors' => $doctors,
        ]);
    }

    public function events(Request $request)
    {
        $user = $request->user();
        $query = Appointment::with(['patient', 'doctor']);

        if ($user->role === 'super_admin') {
            // super admin sees all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } else {
            $query->where('patient_id', $user->id);
        }

        if ($request->filled('doctor_id') && $request->doctor_id !== 'all') {
            $query->where('doctor_id', $request->doctor_id);
        }

        $appointments = $query->get()->map(function ($apt) use ($user) {
            $url = null;
            if ($user->role === 'doctor') {
                $url = route('doctor.appointments.show', $apt->id);
            } elseif ($user->role === 'patient') {
                $url = route('patient.appointments.show', $apt->id);
            } elseif ($user->role === 'clinic_admin') {
                $url = route('clinic-admin.appointments.index');
            } elseif ($user->role === 'super_admin') {
                $url = route('admin.approvals.index');
            }

            $date = $apt->appointment_date ? \Illuminate\Support\Carbon::parse($apt->appointment_date)->format('Y-m-d') : null;
            $time = $apt->appointment_time ? \Illuminate\Support\Carbon::parse($apt->appointment_time)->format('H:i:s') : '09:00:00';
            $start = $date ? "{$date}T{$time}" : null;

            return [
                'id' => $apt->id,
                'title' => ($apt->patient?->name ?? 'Patient'),
                'start' => $start,
                'status' => $apt->status,
                'priority' => $apt->priority,
                'patient' => $apt->patient?->name,
                'doctor' => $apt->doctor?->name,
                'doctor_id' => $apt->doctor_id,
                'patient_id' => $apt->patient_id,
                'appointment_date' => $date,
                'appointment_time' => $time,
                'patient_notes' => $apt->patient_notes,
                'doctor_notes' => $apt->doctor_notes,
                'url' => $url,
            ];
        });

        return response()->json($appointments);
    }

    public function storeRecurring(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'recurrence_type' => 'sometimes|in:weekly,monthly',
            'end_date' => 'sometimes|date|after_or_equal:today',
        ]);

        RecurringAppointment::create([
            'doctor_id' => $request->user()->id,
            'tenant_id' => $request->user()->tenant_id,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'recurrence_type' => $request->recurrence_type ?? 'weekly',
            'end_date' => $request->end_date,
            'is_active' => true,
        ]);

        return back()->with('success', 'Recurring availability created.');
    }

    public function joinWaitlist(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'sometimes|date_format:H:i',
        ]);

        $doctor = UserModel::findOrFail($request->doctor_id);
        if ($doctor->tenant_id !== $request->user()->tenant_id) {
            return back()->withErrors(['doctor_id' => 'Invalid doctor.']);
        }

        AppointmentWaitlist::create([
            'doctor_id' => $request->doctor_id,
            'tenant_id' => $request->user()->tenant_id,
            'patient_id' => $request->user()->id,
            'appointment_date' => $request->appointment_date,
            'preferred_time' => $request->preferred_time,
            'status' => 'waiting',
        ]);

        return back()->with('success', 'Added to waitlist.');
    }
}
