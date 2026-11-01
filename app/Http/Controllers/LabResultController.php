<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\LabResult;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class LabResultController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = LabResult::with(['patient', 'appointment']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->whereIn('appointment_id', function ($q) use ($user) {
                $q->select('id')->from('appointments')->where('doctor_id', $user->id);
            });
        } else {
            $query->where('patient_id', $user->id);
        }

        $results = $query->paginate(15);

        return inertia('LabResults/Index', [
            'results' => $results,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:users,id',
            'test_name' => 'required|string|max:255',
            'result_value' => 'sometimes|string|max:255',
            'reference_range' => 'sometimes|string|max:255',
            'units' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:pending,completed,abnormal',
            'recorded_at' => 'sometimes|date',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $patient = UserModel::findOrFail($request->patient_id);

        if ($request->user()->role !== 'super_admin' && $patient->tenant_id !== $request->user()->tenant_id) {
            return back()->withErrors(['patient_id' => 'Invalid patient.']);
        }

        LabResult::create([
            'appointment_id' => $request->appointment_id,
            'patient_id' => $request->patient_id,
            'tenant_id' => $patient->tenant_id,
            'test_name' => $request->test_name,
            'result_value' => $request->result_value,
            'reference_range' => $request->reference_range,
            'units' => $request->units,
            'status' => $request->status ?? 'pending',
            'recorded_at' => $request->recorded_at,
        ]);

        return back()->with('success', 'Lab result recorded.');
    }
}
