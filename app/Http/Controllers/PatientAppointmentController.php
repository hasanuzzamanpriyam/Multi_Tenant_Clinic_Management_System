<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DoctorAvailability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientAppointmentController extends Controller
{
    /**
     * Display a listing of the patient's appointments.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::with(['doctor', 'prescriptions'])
            ->where('patient_id', $user->id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('appointment_date')
            ->latest('appointment_time')
            ->paginate(15);

        return Inertia::render('Patient/Appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show the form for creating a new appointment (step-by-step booking).
     */
    public function create(Request $request)
    {
        $user = $request->user();

        $doctors = \App\Models\User::where('tenant_id', $user->tenant_id)
            ->where('role', 'doctor')
            ->where('is_active', true)
            ->with(['availabilities' => fn($q) => $q->where('is_available', true)->orderBy('day_of_week')->orderBy('start_time')])
            ->get();

        return Inertia::render('Patient/BookAppointment', [
            'doctors' => $doctors,
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'patient_notes' => 'nullable|string',
        ]);

        // Verify doctor belongs to same tenant
        $doctor = \App\Models\User::findOrFail($validated['doctor_id']);
        if ($doctor->tenant_id !== $user->tenant_id || $doctor->role !== 'doctor') {
            return back()->withErrors(['doctor_id' => 'Invalid doctor selected.']);
        }

        // Check if doctor is available at that time
        $dayOfWeek = (int) date('w', strtotime($validated['appointment_date']));
        $isAvailable = DoctorAvailability::where('doctor_id', $validated['doctor_id'])
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $validated['appointment_time'])
            ->where('end_time', '>', $validated['appointment_time'])
            ->exists();

        if (! $isAvailable) {
            return back()->withErrors(['appointment_time' => 'Doctor is not available at the selected time.']);
        }

        // Check for existing appointment at same time
        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($conflict) {
            return back()->withErrors(['appointment_time' => 'Doctor already has an appointment at this time.']);
        }

        $validated['tenant_id'] = $user->tenant_id;
        $validated['patient_id'] = $user->id;
        $validated['status'] = 'pending';

        Appointment::create($validated);

        return redirect()->route('patient.appointments.index')
            ->with('success', 'Appointment request submitted successfully. Awaiting approval.');
    }

    /**
     * Display the specified appointment.
     */
    public function show(Request $request, Appointment $appointment)
    {
        $this->authorizePatient($appointment);
        $appointment->load(['doctor', 'patient', 'clinic', 'prescriptions']);

        return Inertia::render('Patient/AppointmentShow', [
            'appointment' => $appointment,
        ]);
    }

    /**
     * Ensure the appointment belongs to the authenticated patient.
     */
    private function authorizePatient(Appointment $appointment): void
    {
        $user = request()->user();
        if ($appointment->patient_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }
    }
}