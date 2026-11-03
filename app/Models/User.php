<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\InsuranceClaim;
use App\Models\PaymentMethod;

#[Fillable([
    'name',
    'email',
    'locale',
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
     * Get the notification preferences for the user.
     */
    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    /**
     * Get the medical histories where the user is the patient.
     */
    public function medicalHistories(): HasMany
    {
        return $this->hasMany(MedicalHistory::class, 'patient_id');
    }

    /**
     * Get the lab results where the user is the patient.
     */
    public function labResults(): HasMany
    {
        return $this->hasMany(LabResult::class, 'patient_id');
    }

    /**
     * Get the document uploads where the user is the patient.
     */
    public function documentUploads(): HasMany
    {
        return $this->hasMany(DocumentUpload::class, 'patient_id');
    }

    /**
     * Get the immunization records where the user is the patient.
     */
    public function immunizationRecords(): HasMany
    {
        return $this->hasMany(ImmunizationRecord::class, 'patient_id');
    }

    /**
     * Get the doctor reviews where the user is the patient.
     */
    public function doctorReviews(): HasMany
    {
        return $this->hasMany(DoctorReview::class, 'patient_id');
    }

    /**
     * Get the doctor reviews where the user is the doctor.
     */
    public function receivedReviews(): HasMany
    {
        return $this->hasMany(DoctorReview::class, 'doctor_id');
    }

    /**
     * Get the referrals from this doctor.
     */
    public function referralsFrom(): HasMany
    {
        return $this->hasMany(DoctorReferral::class, 'from_doctor_id');
    }

    /**
     * Get the referrals to this doctor.
     */
    public function referralsTo(): HasMany
    {
        return $this->hasMany(DoctorReferral::class, 'to_doctor_id');
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
     * Get the invoices where the user is the patient.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'patient_id');
    }

    /**
     * Get the payments where the user is the patient.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'patient_id');
    }

    /**
     * Get the insurance claims where the user is the patient.
     */
    public function insuranceClaims(): HasMany
    {
        return $this->hasMany(InsuranceClaim::class, 'patient_id');
    }

    /**
     * Get the payment methods where the user is the patient.
     */
    public function paymentMethods(): HasMany
    {
        return $this->hasMany(PaymentMethod::class, 'patient_id');
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
