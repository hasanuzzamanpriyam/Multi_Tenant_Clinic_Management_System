<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClinicAdminAppointmentController extends Controller
{
    /**
     * Display a listing of appointments for the clinic admin's tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $status = $request->input('status');
        $doctorId = $request->input('doctor_id');
        $search = $request->input('search');

        $appointments = Appointment::where('tenant_id', $user->tenant_id)
            ->with(['patient', 'doctor'])
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($doctorId, fn($q) => $q->where('doctor_id', $doctorId))
            ->when($search, function ($q) use ($search) {
                $q->whereHas('patient', fn($p) => $p->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('doctor', fn($d) => $d->where('name', 'like', "%{$search}%"));
            })
            ->latest('appointment_date')
            ->paginate(15)
            ->withQueryString();

        $doctors = User::where('tenant_id', $user->tenant_id)
            ->where('role', 'doctor')
            ->select(['id', 'name', 'specialty'])
            ->get();

        return Inertia::render('clinic-admin/appointments/index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'filters' => [
                'status' => $status ?? '',
                'doctor_id' => $doctorId ?? '',
                'search' => $search ?? '',
            ],
        ]);
    }
}

