<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Invoice;
use App\Models\Payment;

class Appointment extends Model
{
    use BelongsToTenant, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id',
        'patient_id',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'status',
        'priority',
        'patient_notes',
        'doctor_notes',
        'completed_at',
        'cancelled_at',
        'meeting_url',
        'meeting_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'appointment_time' => 'datetime:H:i:s',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Get the patient associated with the appointment.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor associated with the appointment.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the clinic (tenant) associated with the appointment.
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }

    /**
     * Get the prescriptions associated with the appointment.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the lab results associated with the appointment.
     */
    public function labResults()
    {
        return $this->hasMany(LabResult::class);
    }

    /**
     * Get the document uploads associated with the appointment.
     */
    public function documentUploads()
    {
        return $this->hasMany(DocumentUpload::class);
    }

    /**
     * Get the doctor review associated with the appointment.
     */
    public function doctorReview()
    {
        return $this->hasOne(DoctorReview::class);
    }

    /**
     * Get the doctor referral associated with the appointment.
     */
    public function doctorReferral()
    {
        return $this->hasOne(DoctorReferral::class);
    }

    /**
     * Get the invoice associated with the appointment.
     */
    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Get the payments associated with the appointment.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
