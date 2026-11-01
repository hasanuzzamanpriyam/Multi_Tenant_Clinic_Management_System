<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabResult extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'tenant_id',
        'test_name',
        'result_value',
        'reference_range',
        'units',
        'status',
        'file_path',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'status' => 'string',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
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
