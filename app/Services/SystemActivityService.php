<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Support\Collection;

class SystemActivityService
{
    /**
     * Get recent unified activities across all user types and entities.
     *
     * @param int $limit
     * @param string|null $category
     * @param string|null $search
     * @return Collection
     */
    public function getActivities(int $limit = 50, ?string $category = null, ?string $search = null): Collection
    {
        $activities = collect();

        // 1. Users activities (Doctors, Patients, Admins registering)
        if (! $category || $category === 'users') {
            $users = User::with('clinic')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($user) {
                    $roleLabel = match ($user->role) {
                        'doctor' => 'Doctor Registered',
                        'patient' => 'Patient Account Created',
                        'clinic_admin' => 'Clinic Admin Onboarded',
                        'super_admin' => 'Super Admin Provisioned',
                        default => 'User Account Created',
                    };

                    return [
                        'id' => 'u-' . $user->id,
                        'category' => 'users',
                        'category_label' => 'User Registration',
                        'action' => $roleLabel,
                        'user_name' => $user->name,
                        'user_role' => $user->role,
                        'entity' => $user->name,
                        'clinic_name' => $user->clinic?->name ?? 'System-Wide',
                        'clinic_id' => $user->tenant_id,
                        'details' => $user->email . ($user->specialty ? " · {$user->specialty}" : ''),
                        'status' => $user->is_active ? 'Active' : 'Pending',
                        'type' => $user->role === 'doctor' ? 'doctor' : ($user->role === 'patient' ? 'patient' : 'admin'),
                        'time' => $user->created_at ? $user->created_at->diffForHumans() : 'Recently',
                        'created_at' => $user->created_at ? $user->created_at->toIso8601String() : null,
                        'timestamp' => $user->created_at ? $user->created_at->timestamp : 0,
                        'link' => route('admin.users.edit', $user->id),
                    ];
                });

            $activities = $activities->concat($users);
        }

        // 2. Appointment activities (Booked, Approved, Completed, Cancelled)
        if (! $category || $category === 'appointments') {
            $appointments = Appointment::with(['patient', 'doctor', 'clinic'])
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($apt) {
                    $action = match ($apt->status) {
                        'approved' => 'Appointment Approved',
                        'completed' => 'Appointment Completed',
                        'cancelled' => 'Appointment Cancelled',
                        default => 'New Appointment Booked',
                    };

                    $patientName = $apt->patient?->name ?? 'Patient';
                    $doctorName = $apt->doctor?->name ? 'Dr. ' . $apt->doctor->name : 'Doctor';
                    $clinicName = $apt->clinic?->name ?? 'Clinic';

                    return [
                        'id' => 'a-' . $apt->id,
                        'category' => 'appointments',
                        'category_label' => 'Appointment',
                        'action' => $action,
                        'user_name' => $patientName,
                        'user_role' => 'patient',
                        'entity' => "{$patientName} with {$doctorName}",
                        'clinic_name' => $clinicName,
                        'clinic_id' => $apt->tenant_id,
                        'details' => 'Scheduled for ' . ($apt->appointment_date ? $apt->appointment_date->format('M d, Y') : 'Date TBD') . " · {$clinicName}",
                        'status' => ucfirst($apt->status),
                        'type' => $apt->status === 'approved' ? 'success' : ($apt->status === 'pending' ? 'info' : ($apt->status === 'cancelled' ? 'danger' : 'neutral')),
                        'time' => $apt->created_at ? $apt->created_at->diffForHumans() : 'Recently',
                        'created_at' => $apt->created_at ? $apt->created_at->toIso8601String() : null,
                        'timestamp' => $apt->created_at ? $apt->created_at->timestamp : 0,
                        'link' => route('admin.approvals.index'),
                    ];
                });

            $activities = $activities->concat($appointments);
        }

        // 3. Prescription activities
        if (! $category || $category === 'prescriptions') {
            $prescriptions = Prescription::with(['appointment.patient', 'appointment.doctor', 'appointment.clinic'])
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($p) {
                    $patientName = $p->appointment?->patient?->name ?? 'Patient';
                    $doctorName = $p->appointment?->doctor?->name ? 'Dr. ' . $p->appointment->doctor->name : 'Doctor';
                    $clinicName = $p->appointment?->clinic?->name ?? 'Clinic';

                    return [
                        'id' => 'p-' . $p->id,
                        'category' => 'prescriptions',
                        'category_label' => 'Prescription',
                        'action' => "Prescription Issued by {$doctorName}",
                        'user_name' => $doctorName,
                        'user_role' => 'doctor',
                        'entity' => "{$p->medicine_name} for {$patientName}",
                        'clinic_name' => $clinicName,
                        'clinic_id' => $p->tenant_id,
                        'details' => "Dosage: {$p->dosage} · Frequency: {$p->frequency} · {$clinicName}",
                        'status' => 'Issued',
                        'type' => 'prescription',
                        'time' => $p->created_at ? $p->created_at->diffForHumans() : 'Recently',
                        'created_at' => $p->created_at ? $p->created_at->toIso8601String() : null,
                        'timestamp' => $p->created_at ? $p->created_at->timestamp : 0,
                        'link' => route('admin.approvals.index'),
                    ];
                });

            $activities = $activities->concat($prescriptions);
        }

        // 4. Clinic creation activities
        if (! $category || $category === 'clinics') {
            $clinics = Clinic::latest()
                ->limit($limit)
                ->get()
                ->map(function ($c) {
                    return [
                        'id' => 'c-' . $c->id,
                        'category' => 'clinics',
                        'category_label' => 'Clinic Management',
                        'action' => 'New Clinic Registered',
                        'user_name' => $c->name,
                        'user_role' => 'clinic',
                        'entity' => $c->name,
                        'clinic_name' => $c->name,
                        'clinic_id' => $c->id,
                        'details' => $c->email . ($c->phone ? " · {$c->phone}" : ''),
                        'status' => 'Active Tenant',
                        'type' => 'clinic',
                        'time' => $c->created_at ? $c->created_at->diffForHumans() : 'Recently',
                        'created_at' => $c->created_at ? $c->created_at->toIso8601String() : null,
                        'timestamp' => $c->created_at ? $c->created_at->timestamp : 0,
                        'link' => route('admin.clinics.show', $c->id),
                    ];
                });

            $activities = $activities->concat($clinics);
        }

        // Filter by search query if present
        if ($search) {
            $searchLower = strtolower($search);
            $activities = $activities->filter(function ($item) use ($searchLower) {
                return str_contains(strtolower($item['action']), $searchLower)
                    || str_contains(strtolower($item['entity']), $searchLower)
                    || str_contains(strtolower($item['details']), $searchLower)
                    || str_contains(strtolower($item['clinic_name']), $searchLower);
            });
        }

        // Sort by timestamp descending and take the requested limit
        return $activities->sortByDesc('timestamp')->take($limit)->values();
    }
}

