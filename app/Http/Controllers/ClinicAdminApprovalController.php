<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClinicAdminApprovalController extends Controller
{
    /**
     * Display a listing of pending doctor registrations for the clinic admin's tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $pendingDoctors = User::where('tenant_id', $user->tenant_id)
            ->where('role', 'doctor')
            ->where('is_active', false)
            ->latest()
            ->paginate(15);

        return Inertia::render('clinic-admin/approvals/index', [
            'pendingDoctors' => $pendingDoctors,
        ]);
    }

    /**
     * Approve the specified doctor registration.
     */
    public function approve(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);

        if ($doctor->role !== 'doctor') {
            abort(403, 'User is not a doctor.');
        }

        $doctor->update([
            'is_active' => true,
        ]);

        return back()->with('success', 'Doctor approved successfully.');
    }

    /**
     * Reject the specified doctor registration.
     */
    public function reject(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);

        if ($doctor->role !== 'doctor') {
            abort(403, 'User is not a doctor.');
        }

        $doctor->delete();

        return back()->with('success', 'Doctor registration rejected and removed.');
    }

    /**
     * Ensure the doctor belongs to the user's tenant.
     */
    private function authorizeTenant(User $doctor): void
    {
        $user = request()->user();
        if ($doctor->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }
    }
}