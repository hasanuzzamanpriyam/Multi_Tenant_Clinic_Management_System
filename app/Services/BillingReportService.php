<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\InsuranceClaim;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BillingReportService
{
    public function getRevenueSummary(int $tenantId, string $period = 'month'): array
    {
        $query = Invoice::where('tenant_id', $tenantId);

        if ($period === 'month') {
            $query->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        } elseif ($period === 'quarter') {
            $query->whereQuarter('created_at', now()->quarter)
                ->whereYear('created_at', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('created_at', now()->year);
        }

        $invoices = $query->get();

        return [
            'total_invoiced' => $invoices->sum('total'),
            'total_paid' => $invoices->sum(function ($inv) {
                return $inv->payments()->where('status', 'completed')->sum('amount');
            }),
            'total_pending' => $invoices->whereIn('status', ['sent', 'partially_paid'])->sum('total'),
            'total_overdue' => $invoices->where('status', 'overdue')->sum('total'),
            'invoice_count' => $invoices->count(),
            'paid_invoice_count' => $invoices->where('status', 'paid')->count(),
        ];
    }

    public function getPaymentCollectionReport(int $tenantId, string $period = 'month'): array
    {
        $query = Payment::where('tenant_id', $tenantId)
            ->where('status', 'completed');

        if ($period === 'month') {
            $query->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year);
        } elseif ($period === 'quarter') {
            $query->whereQuarter('paid_at', now()->quarter)
                ->whereYear('paid_at', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('paid_at', now()->year);
        }

        $payments = $query->get();

        $byMethod = $payments->groupBy('payment_method')
            ->map(fn ($group) => [
                'count' => $group->count(),
                'total' => $group->sum('amount'),
            ]);

        return [
            'total_collected' => $payments->sum('amount'),
            'payment_count' => $payments->count(),
            'average_payment' => $payments->avg('amount'),
            'by_method' => $byMethod,
        ];
    }

    public function getAgingReport(int $tenantId): array
    {
        $invoices = Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['sent', 'partially_paid', 'overdue'])
            ->get();

        $buckets = [
            'current' => ['label' => 'Current', 'total' => 0, 'count' => 0],
            '1-30' => ['label' => '1-30 Days', 'total' => 0, 'count' => 0],
            '31-60' => ['label' => '31-60 Days', 'total' => 0, 'count' => 0],
            '61-90' => ['label' => '61-90 Days', 'total' => 0, 'count' => 0],
            '91-120' => ['label' => '91-120 Days', 'total' => 0, 'count' => 0],
            '120+' => ['label' => '120+ Days', 'total' => 0, 'count' => 0],
        ];

        foreach ($invoices as $invoice) {
            $daysOverdue = $invoice->due_date
                ? max(0, now()->diffInDays($invoice->due_date, false))
                : 0;

            $balance = $invoice->balance;

            if ($daysOverdue <= 0) {
                $bucket = 'current';
            } elseif ($daysOverdue <= 30) {
                $bucket = '1-30';
            } elseif ($daysOverdue <= 60) {
                $bucket = '31-60';
            } elseif ($daysOverdue <= 90) {
                $bucket = '61-90';
            } elseif ($daysOverdue <= 120) {
                $bucket = '91-120';
            } else {
                $bucket = '120+';
            }

            $buckets[$bucket]['total'] += $balance;
            $buckets[$bucket]['count'] += 1;
        }

        return $buckets;
    }

    public function getPatientStatements(int $tenantId): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('tenant_id', $tenantId)
            ->where('role', 'patient')
            ->with(['invoices' => function ($q) {
                $q->whereIn('status', ['sent', 'partially_paid', 'overdue', 'paid'])
                    ->with('payments');
            }])
            ->get()
            ->map(function ($patient) {
                $totalInvoiced = $patient->invoices->sum('total');
                $totalPaid = $patient->invoices->flatMap->payments
                    ->where('status', 'completed')
                    ->sum('amount');
                $balance = $patient->invoices->sum('balance');

                return [
                    'patient' => $patient,
                    'total_invoiced' => $totalInvoiced,
                    'total_paid' => $totalPaid,
                    'balance' => $balance,
                    'invoice_count' => $patient->invoices->count(),
                    'overdue_count' => $patient->invoices->where('status', 'overdue')->count(),
                ];
            });
    }

    public function getDoctorEarnings(int $tenantId, string $period = 'month'): \Illuminate\Database\Eloquent\Collection
    {
        $query = Invoice::where('tenant_id', $tenantId)
            ->whereHas('appointment', function ($q) {
                $q->whereNotNull('doctor_id');
            });

        if ($period === 'month') {
            $query->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        } elseif ($period === 'quarter') {
            $query->whereQuarter('created_at', now()->quarter)
                ->whereYear('created_at', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('created_at', now()->year);
        }

        return $query->with('appointment.doctor')
            ->get()
            ->groupBy('appointment.doctor_id')
            ->map(function ($invoices, $doctorId) {
                $doctor = $invoices->first()->appointment->doctor;
                $totalBilled = $invoices->sum('total');
                $totalPaid = $invoices->flatMap->payments
                    ->where('status', 'completed')
                    ->sum('amount');

                return [
                    'doctor' => $doctor,
                    'total_billed' => $totalBilled,
                    'total_paid' => $totalPaid,
                    'pending' => $totalBilled - $totalPaid,
                    'invoice_count' => $invoices->count(),
                ];
            })
            ->values();
    }

    public function getInsuranceClaimSummary(int $tenantId): array
    {
        return [
            'total_claims' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)->count(),
            'total_claimed' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)->sum('amount_claimed'),
            'total_approved' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)->sum('amount_approved'),
            'total_paid' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)->sum('amount_paid'),
            'pending_claims' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)
                ->whereIn('status', ['submitted', 'under_review'])
                ->count(),
            'denied_claims' => \App\Models\InsuranceClaim::where('tenant_id', $tenantId)
                ->where('status', 'denied')
                ->count(),
        ];
    }
}