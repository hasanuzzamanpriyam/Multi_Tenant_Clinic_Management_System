<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Appointment::with(['patient', 'doctor', 'clinic']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } else {
            $query->where('patient_id', $user->id);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role === 'doctor' && $appointment->doctor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role === 'patient' && $appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($appointment->load(['patient', 'doctor', 'clinic', 'prescriptions', 'labResults', 'documentUploads']));
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'patient_notes' => 'sometimes|string',
            'priority' => 'sometimes|in:normal,urgent,emergency',
        ]);

        $user = $request->user();
        $doctor = User::findOrFail($request->doctor_id);

        if ($doctor->tenant_id !== $user->tenant_id || $doctor->role !== 'doctor') {
            return response()->json(['message' => 'Invalid doctor.'], 400);
        }

        $appointment = Appointment::create([
            'tenant_id' => $user->tenant_id,
            'patient_id' => $user->id,
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'patient_notes' => $request->patient_notes,
            'priority' => $request->priority ?? 'normal',
            'status' => 'pending',
        ]);

        return response()->json($appointment, 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'status' => 'sometimes|in:pending,approved,completed,cancelled',
            'doctor_notes' => 'sometimes|string',
            'priority' => 'sometimes|in:normal,urgent,emergency',
        ]);

        $appointment->update($request->only(['status', 'doctor_notes', 'priority']));

        return response()->json($appointment);
    }

    public function destroy(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $appointment->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
