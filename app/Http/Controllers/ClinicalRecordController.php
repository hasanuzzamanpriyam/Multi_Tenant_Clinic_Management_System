<?php

namespace App\Http\Controllers;

use App\Models\MedicalHistory;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class ClinicalRecordController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            return redirect()->route('patient.records.index');
        }

        $query = MedicalHistory::with(['patient']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            // doctors see records of their patients via appointments
            $query->whereIn('patient_id', function ($q) use ($user) {
                $q->select('patient_id')
                    ->from('appointments')
                    ->where('doctor_id', $user->id);
            });
        } else {
            $query->where('patient_id', $user->id);
        }

        $histories = $query->paginate(15);

        return inertia('ClinicalRecords/Index', [
            'histories' => $histories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'condition' => 'required|string|max:255',
            'diagnosis_date' => 'sometimes|date',
            'notes' => 'sometimes|string',
            'is_chronic' => 'sometimes|boolean',
        ]);

        $patient = UserModel::findOrFail($request->patient_id);

        if ($request->user()->role !== 'super_admin' && $patient->tenant_id !== $request->user()->tenant_id) {
            return back()->withErrors(['patient_id' => 'Invalid patient.']);
        }

        MedicalHistory::create([
            'patient_id' => $request->patient_id,
            'tenant_id' => $patient->tenant_id,
            'condition' => $request->condition,
            'diagnosis_date' => $request->diagnosis_date,
            'notes' => $request->notes,
            'is_chronic' => $request->boolean('is_chronic'),
        ]);

        return back()->with('success', 'Medical history recorded.');
    }
}
