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
        $search = $request->input('search');

        $clinics = Clinic::withCount(['users', 'appointments'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Clinics/Index', [
            'clinics' => $clinics,
            'filters' => [
                'search' => $search ?? '',
            ],
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
        $clinic->load([
            'users' => fn ($q) => $q->latest()->limit(25),
            'appointments' => fn ($q) => $q->with(['patient', 'doctor'])->latest()->limit(25),
        ]);
        $clinic->loadCount(['users', 'appointments']);

        return Inertia::render('SuperAdmin/Clinics/Show', [
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