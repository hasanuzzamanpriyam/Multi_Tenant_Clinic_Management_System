<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsuranceClaim extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'appointment_id',
        'invoice_id',
        'insurance_provider',
        'policy_number',
        'claim_number',
        'diagnosis_code',
        'procedure_code',
        'amount_claimed',
        'amount_approved',
        'amount_paid',
        'status',
        'submitted_at',
        'processed_at',
        'denial_reason',
        'notes',
    ];

    protected $casts = [
        'amount_claimed' => 'decimal:2',
        'amount_approved' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }
}