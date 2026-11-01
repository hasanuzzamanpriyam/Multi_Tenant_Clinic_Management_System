<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentWaitlist extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'doctor_id',
        'tenant_id',
        'patient_id',
        'appointment_date',
        'preferred_time',
        'status',
        'notified_at',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'preferred_time' => 'datetime:H:i:s',
        'notified_at' => 'datetime',
        'status' => 'string',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }
}
