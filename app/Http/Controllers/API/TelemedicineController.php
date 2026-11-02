<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class TelemedicineController extends Controller
{
    public function createSession(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $user = $request->user();

        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($appointment->doctor_id !== $user->id && $appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $meetingUrl = 'https://meet.example.com/'.str_replace(' ', '', $appointment->id.'-'.uniqid());
        $meetingToken = bin(random_bytes(16));

        $appointment->update([
            'meeting_url' => $meetingUrl,
            'meeting_token' => $meetingToken,
        ]);

        return response()->json([
            'meeting_url' => $meetingUrl,
            'meeting_token' => $meetingToken,
            'appointment_id' => $appointment->id,
        ]);
    }

    public function joinUrl(Request $request, Appointment $appointment)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($appointment->doctor_id !== $user->id && $appointment->patient_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if (! $appointment->meeting_url) {
            return response()->json(['message' => 'No telemedicine session for this appointment.'], 404);
        }

        return response()->json([
            'meeting_url' => $appointment->meeting_url,
            'meeting_token' => $appointment->meeting_token,
        ]);
    }
}
