<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorAppointmentController extends Controller
{
    /**
     * Display a listing of the doctor's appointments.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::with(['patient', 'prescriptions'])
            ->where('doctor_id', $user->id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date, fn($q) => $q->whereDate('appointment_date', $request->date))
            ->latest('appointment_date')
            ->latest('appointment_time')
            ->paginate(15);

        return Inertia::render('Doctor/Appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'date']),
        ]);
    }

    /**
     * Display the specified appointment.
     */
    public function show(Request $request, Appointment $appointment)
    {
        $this->authorizeDoctor($appointment);
        $appointment->load(['patient', 'doctor', 'clinic', 'prescriptions']);

        return Inertia::render('Doctor/AppointmentShow', [
            'appointment' => $appointment,
        ]);
    }

    /**
     * Confirm the specified appointment.
     */
    public function confirm(Request $request, Appointment $appointment)
    {
        $this->authorizeDoctor($appointment);

        if ($appointment->status !== 'approved') {
            return back()->with('error', 'Only approved appointments can be confirmed.');
        }

        $appointment->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Appointment confirmed and marked as completed.');
    }

    /**
     * Complete the specified appointment with notes and prescriptions.
     */
    public function complete(Request $request, Appointment $appointment)
    {
        $this->authorizeDoctor($appointment);

        if (! in_array($appointment->status, ['approved', 'completed'])) {
            return back()->with('error', 'Appointment cannot be completed in its current state.');
        }

        $request->validate([
            'doctor_notes' => 'nullable|string',
            'prescriptions' => 'nullable|array',
            'prescriptions.*.medicine_name' => 'required_with:prescriptions|string|max:255',
            'prescriptions.*.dosage' => 'required_with:prescriptions|string|max:255',
            'prescriptions.*.frequency' => 'required_with:prescriptions|string|max:255',
            'prescriptions.*.duration' => 'required_with:prescriptions|string|max:255',
            'prescriptions.*.special_instructions' => 'nullable|string',
        ]);

        $appointment->update([
            'status' => 'completed',
            'doctor_notes' => $request->doctor_notes,
            'completed_at' => now(),
        ]);

        // Save prescriptions
        if ($request->has('prescriptions') && is_array($request->prescriptions)) {
            foreach ($request->prescriptions as $prescriptionData) {
                Prescription::create([
                    'tenant_id' => $appointment->tenant_id,
                    'appointment_id' => $appointment->id,
                    'medicine_name' => $prescriptionData['medicine_name'],
                    'dosage' => $prescriptionData['dosage'],
                    'frequency' => $prescriptionData['frequency'],
                    'duration' => $prescriptionData['duration'],
                    'special_instructions' => $prescriptionData['special_instructions'] ?? null,
                ]);
            }
        }

        return back()->with('success', 'Appointment completed successfully with prescriptions.');
    }

    /**
     * Ensure the appointment belongs to the authenticated doctor.
     */
    private function authorizeDoctor(Appointment $appointment): void
    {
        $user = request()->user();
        if ($appointment->doctor_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }
    }
}