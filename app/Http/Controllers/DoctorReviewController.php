<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DoctorReview;
use App\Models\User as UserModel;
use Illuminate\Http\Request;

class DoctorReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = DoctorReview::with(['patient', 'doctor', 'appointment'])
            ->where('is_approved', true);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } else {
            // patients see all approved reviews
        }

        $reviews = $query->paginate(15);

        return inertia('DoctorReviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'required|exists:appointments,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'sometimes|string',
            'is_anonymous' => 'sometimes|boolean',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $doctor = UserModel::findOrFail($request->doctor_id);

        if ($appointment->patient_id !== $request->user()->id) {
            return back()->withErrors(['appointment_id' => 'You can only review your own appointments.']);
        }

        if ($appointment->status !== 'completed') {
            return back()->withErrors(['appointment_id' => 'You can only review completed appointments.']);
        }

        DoctorReview::create([
            'patient_id' => $request->user()->id,
            'doctor_id' => $request->doctor_id,
            'tenant_id' => $appointment->tenant_id,
            'appointment_id' => $request->appointment_id,
            'rating' => $request->rating,
            'review_text' => $request->review_text,
            'is_anonymous' => $request->boolean('is_anonymous'),
            'is_approved' => false,
        ]);

        return back()->with('success', 'Review submitted for moderation.');
    }

    public function moderate(Request $request, DoctorReview $review)
    {
        if ($request->user()->role !== 'super_admin' && $request->user()->role !== 'clinic_admin') {
            abort(403, 'Only admins can moderate reviews.');
        }

        if ($request->user()->role === 'clinic_admin' && $review->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'is_approved' => 'required|boolean',
        ]);

        $review->update(['is_approved' => $request->boolean('is_approved')]);

        return back()->with('success', 'Review moderated.');
    }
}
