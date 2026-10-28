<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminApprovalController extends Controller
{
    /**
     * Display a listing of pending approvals across all tenants.
     */
    public function index(Request $request)
    {
        $appointments = Appointment::with(['patient', 'doctor', 'clinic'])
            ->where('status', 'pending')
            ->when($request->tenant_id, fn($q) => $q->where('tenant_id', $request->tenant_id))
            ->latest()
            ->paginate(15);

        return Inertia::render('super-admin/approvals/index', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Approve the specified appointment.
     */
    public function approve(Request $request, Appointment $appointment)
    {
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
}