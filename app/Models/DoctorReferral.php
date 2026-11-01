<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorReferral extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'patient_id',
        'tenant_id',
        'from_doctor_id',
        'to_doctor_id',
        'reason',
        'status',
        'referral_date',
        'appointment_id',
    ];

    protected $casts = [
        'referral_date' => 'date',
        'status' => 'string',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function fromDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_doctor_id');
    }

    public function toDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_doctor_id');
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
