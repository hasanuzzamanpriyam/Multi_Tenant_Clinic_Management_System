<?php

namespace App\Http\Controllers;

use App\Models\DoctorReferral;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class DoctorReferralController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = DoctorReferral::with(['patient', 'fromDoctor', 'toDoctor', 'appointment']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->where(function ($q) use ($user) {
                $q->where('from_doctor_id', $user->id)
                    ->orWhere('to_doctor_id', $user->id);
            });
        } else {
            $query->where('patient_id', $user->id);
        }

        $referrals = $query->paginate(15);

        return inertia('Referrals/Index', [
            'referrals' => $referrals,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'to_doctor_id' => 'required|exists:users,id',
            'reason' => 'required|string',
            'referral_date' => 'sometimes|date',
            'appointment_id' => 'sometimes|exists:appointments,id',
        ]);

        $patient = UserModel::findOrFail($request->patient_id);
        $toDoctor = UserModel::findOrFail($request->to_doctor_id);

        if ($request->user()->role !== 'super_admin'
            && ($patient->tenant_id !== $request->user()->tenant_id || $toDoctor->tenant_id !== $request->user()->tenant_id)
        ) {
            return back()->withErrors(['patient_id' => 'Invalid patient or doctor.']);
        }

        DoctorReferral::create([
            'patient_id' => $request->patient_id,
            'tenant_id' => $patient->tenant_id,
            'from_doctor_id' => $request->user()->id,
            'to_doctor_id' => $request->to_doctor_id,
            'reason' => $request->reason,
            'status' => 'pending',
            'referral_date' => $request->referral_date,
            'appointment_id' => $request->appointment_id,
        ]);

        return back()->with('success', 'Referral sent.');
    }

    public function update(Request $request, DoctorReferral $referral)
    {
        $request->validate([
            'status' => 'required|in:accepted,completed,rejected',
        ]);

        if ($request->user()->id !== $referral->to_doctor_id && $request->user()->role !== 'super_admin') {
            abort(403, 'Only the referred doctor can update status.');
        }

        $referral->update(['status' => $request->status]);

        return back()->with('success', 'Referral status updated.');
    }
}
