<?php

namespace App\Services;

use App\Models\InsuranceClaim;
use App\Models\Invoice;
use App\Models\Appointment;
use Exception;

class InsuranceClaimService
{
    public function createClaim(
        Invoice $invoice,
        array $claimData
    ): InsuranceClaim {
        $claimNumber = $this->generateClaimNumber();

        return InsuranceClaim::create([
            'tenant_id' => $invoice->tenant_id,
            'patient_id' => $invoice->patient_id,
            'appointment_id' => $invoice->appointment_id,
            'invoice_id' => $invoice->id,
            'insurance_provider' => $claimData['insurance_provider'],
            'policy_number' => $claimData['policy_number'],
            'claim_number' => $claimNumber,
            'diagnosis_code' => $claimData['diagnosis_code'] ?? null,
            'procedure_code' => $claimData['procedure_code'] ?? null,
            'amount_claimed' => $claimData['amount_claimed'] ?? $invoice->total,
            'status' => 'draft',
        ]);
    }

    public function submitClaim(InsuranceClaim $claim): bool
    {
        if ($claim->status !== 'draft') {
            return false;
        }

        $claim->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // TODO: Submit to insurance provider via EDI/API
        // $this->submitToProvider($claim);

        return true;
    }

    public function updateClaimStatus(InsuranceClaim $claim, string $status, ?string $denialReason = null): void
    {
        $claim->update([
            'status' => $status,
            'processed_at' => now(),
            'denial_reason' => $denialReason,
        ]);

        if ($status === 'approved') {
            $claim->update(['amount_approved' => $claim->amount_claimed]);
        } elseif ($status === 'paid') {
            $claim->update(['amount_paid' => $claim->amount_approved]);
            $this->createPaymentFromClaim($claim);
        }
    }

    public function getClaimStatusCounts(int $tenantId): array
    {
        return [
            'draft' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'draft')->count(),
            'submitted' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'submitted')->count(),
            'under_review' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'under_review')->count(),
            'approved' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'approved')->count(),
            'denied' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'denied')->count(),
            'paid' => InsuranceClaim::where('tenant_id', $tenantId)->where('status', 'paid')->count(),
        ];
    }

    public function getClaimAgingReport(int $tenantId): \Illuminate\Database\Eloquent\Collection
    {
        return InsuranceClaim::where('tenant_id', $tenantId)
            ->whereIn('status', ['submitted', 'under_review'])
            ->with(['patient', 'invoice'])
            ->orderBy('submitted_at')
            ->get()
            ->map(function ($claim) {
                $daysSinceSubmission = $claim->submitted_at
                    ? $claim->submitted_at->diffInDays(now())
                    : 0;

                return [
                    'claim' => $claim,
                    'days_pending' => $daysSinceSubmission,
                    'aging_bucket' => $this->getAgingBucket($daysSinceSubmission),
                ];
            });
    }

    protected function generateClaimNumber(): string
    {
        $prefix = 'CLM';
        $date = now()->format('Ymd');
        $lastClaim = InsuranceClaim::where('claim_number', 'like', "{$prefix}{$date}%")
            ->orderBy('claim_number', 'desc')
            ->first();

        $sequence = 1;
        if ($lastClaim) {
            $lastSequence = (int) substr($lastClaim->claim_number, -4);
            $sequence = $lastSequence + 1;
        }

        return "{$prefix}{$date}" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected function getAgingBucket(int $days): string
    {
        if ($days <= 30) return '0-30';
        if ($days <= 60) return '31-60';
        if ($days <= 90) return '61-90';
        if ($days <= 120) return '91-120';
        return '120+';
    }

    protected function createPaymentFromClaim(InsuranceClaim $claim): void
    {
        // Create payment record for insurance payment
        \App\Models\Payment::create([
            'tenant_id' => $claim->tenant_id,
            'invoice_id' => $claim->invoice_id,
            'patient_id' => $claim->patient_id,
            'appointment_id' => $claim->appointment_id,
            'amount' => $claim->amount_paid,
            'currency' => 'USD',
            'payment_method' => 'insurance',
            'transaction_id' => $claim->claim_number,
            'status' => 'completed',
            'paid_at' => now(),
            'metadata' => ['claim_id' => $claim->id],
        ]);
    }
}