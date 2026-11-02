<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethod extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'type',
        'gateway_customer_id',
        'gateway_payment_method_id',
        'brand',
        'last4',
        'exp_month',
        'exp_year',
        'is_default',
    ];

    protected $casts = [
        'exp_month' => 'integer',
        'exp_year' => 'integer',
        'is_default' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'tenant_id');
    }
}