<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class ImmunizationRecordController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ImmunizationRecord::with(['patient', 'administrator']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->whereIn('patient_id', function ($q) use ($user) {
                $q->select('patient_id')->from('appointments')->where('doctor_id', $user->id);
            })->orWhere('administered_by', $user->id);
        } else {
            $query->where('patient_id', $user->id);
        }

        $records = $query->paginate(15);

        return inertia('Immunizations/Index', [
            'records' => $records,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'vaccine_name' => 'required|string|max:255',
            'dose_number' => 'sometimes|integer|min:1',
            'administered_at' => 'sometimes|date',
            'next_due_at' => 'sometimes|date|after:administered_at',
        ]);

        $patient = UserModel::findOrFail($request->patient_id);

        if ($request->user()->role !== 'super_admin' && $patient->tenant_id !== $request->user()->tenant_id) {
            return back()->withErrors(['patient_id' => 'Invalid patient.']);
        }

        ImmunizationRecord::create([
            'patient_id' => $request->patient_id,
            'tenant_id' => $patient->tenant_id,
            'vaccine_name' => $request->vaccine_name,
            'dose_number' => $request->dose_number ?? 1,
            'administered_at' => $request->administered_at,
            'next_due_at' => $request->next_due_at,
            'administered_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Immunization record saved.');
    }
}
