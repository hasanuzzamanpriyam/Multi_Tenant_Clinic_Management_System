<?php

namespace App\Http\Controllers;

use App\Models\DoctorAvailability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorAvailabilityController extends Controller
{
    /**
     * Display a listing of the doctor's availabilities.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $availabilities = DoctorAvailability::where('doctor_id', $user->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('doctor/availabilities/index', [
            'availabilities' => $availabilities,
        ]);
    }

    /**
     * Show the form for creating a new availability.
     */
    public function create(Request $request)
    {
        return Inertia::render('doctor/availabilities/create');
    }

    /**
     * Store a newly created availability.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
        ]);

        $validated['tenant_id'] = $user->tenant_id;
        $validated['doctor_id'] = $user->id;

        DoctorAvailability::create($validated);

        return redirect()->route('doctor.availability.index')
            ->with('success', 'Availability created successfully.');
    }

    /**
     * Show the form for editing the specified availability.
     */
    public function edit(Request $request, DoctorAvailability $availability)
    {
        $this->authorizeDoctor($availability);

        return Inertia::render('doctor/availabilities/edit', [
            'availability' => $availability,
        ]);
    }

    /**
     * Update the specified availability.
     */
    public function update(Request $request, DoctorAvailability $availability)
    {
        $this->authorizeDoctor($availability);

        $validated = $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
        ]);

        $availability->update($validated);

        return redirect()->route('doctor.availability.index')
            ->with('success', 'Availability updated successfully.');
    }

    /**
     * Remove the specified availability.
     */
    public function destroy(Request $request, DoctorAvailability $availability)
    {
        $this->authorizeDoctor($availability);
        $availability->delete();

        return redirect()->route('doctor.availability.index')
            ->with('success', 'Availability deleted successfully.');
    }

    /**
     * Ensure the availability belongs to the authenticated doctor.
     */
    private function authorizeDoctor(DoctorAvailability $availability): void
    {
        $user = request()->user();
        if ($availability->doctor_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }
    }
}