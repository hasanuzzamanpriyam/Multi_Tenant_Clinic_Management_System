<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClinicPatientController extends Controller
{
    /**
     * Display a listing of patients for the clinic admin's tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $patients = User::where('tenant_id', $user->tenant_id)
            ->where('role', 'patient')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15);

        return Inertia::render('clinic-admin/patients/index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new patient.
     */
    public function create(Request $request)
    {
        return Inertia::render('clinic-admin/patients/create');
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
        ]);

        $validated['tenant_id'] = $user->tenant_id;
        $validated['role'] = 'patient';

        User::create($validated);

        return redirect()->route('clinic-admin.patients.index')
            ->with('success', 'Patient created successfully.');
    }

    /**
     * Display the specified patient.
     */
    public function show(Request $request, User $patient)
    {
        $this->authorizeTenant($patient);
        $patient->load(['appointments' => fn($q) => $q->latest()->limit(10)]);

        return Inertia::render('clinic-admin/patients/show', [
            'patient' => $patient,
        ]);
    }

    /**
     * Show the form for editing the specified patient.
     */
    public function edit(Request $request, User $patient)
    {
        $this->authorizeTenant($patient);

        return Inertia::render('clinic-admin/patients/edit', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, User $patient)
    {
        $this->authorizeTenant($patient);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $patient->id,
            'phone' => 'nullable|string|max:20',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->validate(['password' => 'required|string|min:8|confirmed'])['password'];
        }

        $patient->update($validated);

        return redirect()->route('clinic-admin.patients.index')
            ->with('success', 'Patient updated successfully.');
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(Request $request, User $patient)
    {
        $this->authorizeTenant($patient);
        $patient->delete();

        return redirect()->route('clinic-admin.patients.index')
            ->with('success', 'Patient deleted successfully.');
    }

    /**
     * Ensure the patient belongs to the user's tenant.
     */
    private function authorizeTenant(User $patient): void
    {
        $user = request()->user();
        if ($patient->tenant_id !== $user->tenant_id || $patient->role !== 'patient') {
            abort(403, 'Unauthorized.');
        }
    }
}