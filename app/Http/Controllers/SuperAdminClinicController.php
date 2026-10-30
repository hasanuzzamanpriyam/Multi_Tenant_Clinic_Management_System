<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminClinicController extends Controller
{
    /**
     * Display a listing of all clinics.
     */
    public function index(Request $request)
    {
        $clinics = Clinic::withCount(['users', 'appointments'])
            ->latest()
            ->paginate(15);

        return Inertia::render('SuperAdmin/Clinics/Index', [
            'clinics' => $clinics,
        ]);
    }

    /**
     * Show the form for creating a new clinic.
     */
    public function create(Request $request)
    {
        return Inertia::render('SuperAdmin/Clinics/Form');
    }

    /**
     * Store a newly created clinic.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clinics,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $clinic = Clinic::create($validated);

        return redirect()->route('admin.clinics.index')
            ->with('success', 'Clinic created successfully.');
    }

    /**
     * Display the specified clinic.
     */
    public function show(Request $request, Clinic $clinic)
    {
        $clinic->load(['users', 'appointments' => fn($q) => $q->latest()->limit(10)]);

        return Inertia::render('super-admin/clinics/show', [
            'clinic' => $clinic,
        ]);
    }

    /**
     * Show the form for editing the specified clinic.
     */
    public function edit(Request $request, Clinic $clinic)
    {
        return Inertia::render('SuperAdmin/Clinics/Form', [
            'clinic' => $clinic,
        ]);
    }

    /**
     * Update the specified clinic.
     */
    public function update(Request $request, Clinic $clinic)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clinics,email,' . $clinic->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $clinic->update($validated);

        return redirect()->route('admin.clinics.index')
            ->with('success', 'Clinic updated successfully.');
    }

    /**
     * Remove the specified clinic.
     */
    public function destroy(Request $request, Clinic $clinic)
    {
        $clinic->delete();

        return redirect()->route('admin.clinics.index')
            ->with('success', 'Clinic deleted successfully.');
    }
}