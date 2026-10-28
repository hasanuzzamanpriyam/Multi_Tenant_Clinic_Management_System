<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClinicDoctorController extends Controller
{
    /**
     * Display a listing of doctors for the clinic admin's tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $doctors = User::where('tenant_id', $user->tenant_id)
            ->where('role', 'doctor')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15);

        return Inertia::render('clinic-admin/doctors/index', [
            'doctors' => $doctors,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new doctor.
     */
    public function create(Request $request)
    {
        return Inertia::render('clinic-admin/doctors/create');
    }

    /**
     * Store a newly created doctor.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
        ]);

        $validated['tenant_id'] = $user->tenant_id;
        $validated['role'] = 'doctor';

        User::create($validated);

        return redirect()->route('clinic-admin.doctors.index')
            ->with('success', 'Doctor created successfully.');
    }

    /**
     * Display the specified doctor.
     */
    public function show(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);
        $doctor->load(['availabilities', 'appointments' => fn($q) => $q->latest()->limit(10)]);

        return Inertia::render('clinic-admin/doctors/show', [
            'doctor' => $doctor,
        ]);
    }

    /**
     * Show the form for editing the specified doctor.
     */
    public function edit(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);

        return Inertia::render('clinic-admin/doctors/edit', [
            'doctor' => $doctor,
        ]);
    }

    /**
     * Update the specified doctor.
     */
    public function update(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $doctor->id,
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->validate(['password' => 'required|string|min:8|confirmed'])['password'];
        }

        $doctor->update($validated);

        return redirect()->route('clinic-admin.doctors.index')
            ->with('success', 'Doctor updated successfully.');
    }

    /**
     * Remove the specified doctor.
     */
    public function destroy(Request $request, User $doctor)
    {
        $this->authorizeTenant($doctor);
        $doctor->delete();

        return redirect()->route('clinic-admin.doctors.index')
            ->with('success', 'Doctor deleted successfully.');
    }

    /**
     * Ensure the doctor belongs to the user's tenant.
     */
    private function authorizeTenant(User $doctor): void
    {
        $user = request()->user();
        if ($doctor->tenant_id !== $user->tenant_id || $doctor->role !== 'doctor') {
            abort(403, 'Unauthorized.');
        }
    }
}