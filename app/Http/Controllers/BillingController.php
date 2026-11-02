<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\InsuranceClaim;
use App\Models\User;
use App\Services\BillingReportService;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class BillingController extends Controller
{
    protected BillingReportService $reportService;
    protected InvoiceService $invoiceService;

    public function __construct(BillingReportService $reportService, InvoiceService $invoiceService)
    {
        $this->reportService = $reportService;
        $this->invoiceService = $invoiceService;
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin') {
            // Super admin sees cross-tenant overview - use a default or get first clinic
            $tenantId = \App\Models\Clinic::first()->id ?? 1;
        } else {
            $tenantId = $user->tenant_id;
            if (!$tenantId) {
                abort(403, 'No clinic assigned.');
            }
        }

        $revenueSummary = $this->reportService->getRevenueSummary($tenantId, $request->get('period', 'month'));
        $paymentReport = $this->reportService->getPaymentCollectionReport($tenantId, $request->get('period', 'month'));
        $agingReport = $this->reportService->getAgingReport($tenantId);
        $insuranceSummary = $this->reportService->getInsuranceClaimSummary($tenantId);

        $period = $request->get('period', 'month');

        return Inertia::render('Billing/Dashboard', [
            'revenueSummary' => $revenueSummary,
            'paymentReport' => $paymentReport,
            'agingReport' => $agingReport,
            'insuranceSummary' => $insuranceSummary,
            'period' => $period,
        ]);
    }

    public function patientStatements(Request $request)
    {
        $user = $request->user();

        $tenantId = $user->role === 'super_admin' ? $request->get('tenant_id') : $user->tenant_id;

        $statements = $this->reportService->getPatientStatements($tenantId);

        return Inertia::render('Billing/PatientStatements', [
            'statements' => $statements,
        ]);
    }

    public function doctorEarnings(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $user->role !== 'clinic_admin' && $user->role !== 'doctor') {
            abort(403, 'Unauthorized.');
        }

        $tenantId = $user->tenant_id;

        if ($user->role === 'doctor') {
            $earnings = $this->reportService->getDoctorEarnings($tenantId, $request->get('period', 'month'))
                ->filter(fn ($e) => $e['doctor']->id === $user->id);
        } else {
            $earnings = $this->reportService->getDoctorEarnings($tenantId, $request->get('period', 'month'));
        }

        return Inertia::render('Billing/DoctorEarnings', [
            'earnings' => $earnings,
            'period' => $request->get('period', 'month'),
        ]);
    }

    public function agingReport(Request $request)
    {
        $user = $request->user();

        $tenantId = $user->tenant_id ?? ($user->role === 'super_admin' ? $request->get('tenant_id') : $user->tenant_id);

        $agingReport = $this->reportService->getAgingReport($tenantId);

        return Inertia::render('Billing/AgingReport', [
            'agingReport' => $agingReport,
        ]);
    }

    public function exportAgingPdf(Request $request)
    {
        $user = $request->user();

        $tenantId = $user->tenant_id ?? ($user->role === 'super_admin' ? $request->get('tenant_id') : $user->tenant_id);

        $agingReport = $this->reportService->getAgingReport($tenantId);

        $pdf = Pdf::loadView('billing.aging-report-pdf', [
            'agingReport' => $agingReport,
            'tenant' => $user->clinic ?? ['name' => 'All Clinics'],
            'generatedAt' => now(),
        ]);

        return $pdf->download('aging-report-' . now()->format('Y-m-d') . '.pdf');
    }
}