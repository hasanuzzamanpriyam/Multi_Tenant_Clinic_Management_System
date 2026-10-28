<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClinicAdminApprovalController extends Controller
{
    /**
     * Display a listing of pending approvals for the clinic admin's tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::with(['patient', 'doctor'])
            ->where('tenant_id', $user->tenant_id)
            ->where('status', 'pending')
            ->latest()
            ->paginate(15);

        return Inertia::render('clinic-admin/approvals/index', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Approve the specified appointment.
     */
    public function approve(Request $request, Appointment $appointment)
    {
        $this->authorizeTenant($appointment);

        $appointment->update([
            'status' => 'approved',
        ]);

        return back()->with('success', 'Appointment approved successfully.');
    }

    /**
     * Reject the specified appointment.
     */
    public function reject(Request $request, Appointment $appointment)
    {
        $this->authorizeTenant($appointment);

        $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $appointment->update([
            'status' => 'cancelled',
            'doctor_notes' => $request->rejection_reason,
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Appointment rejected successfully.');
    }

    /**
     * Ensure the appointment belongs to the user's tenant.
     */
    private function authorizeTenant(Appointment $appointment): void
    {
        $user = request()->user();
        if ($appointment->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }
    }
}