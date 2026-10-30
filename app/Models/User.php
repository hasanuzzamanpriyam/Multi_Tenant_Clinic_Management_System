<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'email',
    'password',
    'tenant_id',
    'role',
    'phone',
    'specialty',
    'age',
    'gender',
    'is_active',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'two_factor_confirmed_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use BelongsToTenant, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the clinic that the user belongs to.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }

    /**
     * Get the tenant (clinic) that the user belongs to.
     * Alias for clinic() relationship.
     */
    public function tenant(): BelongsTo
    {
        return $this->clinic();
    }

    /**
     * Get the appointments where the user is the patient.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    /**
     * Get the appointments where the user is the doctor.
     */
    public function doctorAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    /**
     * Get the doctor's availability schedule.
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(DoctorAvailability::class, 'doctor_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
}
