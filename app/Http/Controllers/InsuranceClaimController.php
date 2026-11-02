<?php

namespace App\Http\Controllers;

use App\Models\InsuranceClaim;
use App\Models\Invoice;
use App\Models\Appointment;
use App\Models\User;
use App\Services\InsuranceClaimService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceClaimController extends Controller
{
    protected InsuranceClaimService $claimService;

    public function __construct(InsuranceClaimService $claimService)
    {
        $this->claimService = $claimService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = InsuranceClaim::with(['patient', 'invoice', 'appointment'])
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $claims = $query->latest('submitted_at')->paginate(15);

        $statusCounts = $this->claimService->getClaimStatusCounts($user->tenant_id ?? 0);

        return Inertia::render('Billing/InsuranceClaims/Index', [
            'claims' => $claims,
            'filters' => $request->only(['status', 'patient_id']),
            'statusCounts' => $statusCounts,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $invoices = Invoice::with(['patient', 'appointment'])
            ->whereIn('status', ['sent', 'partially_paid', 'paid'])
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get();

        $appointments = \App\Models\Appointment::with(['patient', 'doctor'])
            ->where('status', 'completed')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get();

        return Inertia::render('Billing/InsuranceClaims/Create', [
            'invoices' => $invoices,
            'appointments' => $appointments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'insurance_provider' => 'required|string|max:255',
            'policy_number' => 'required|string|max:255',
            'diagnosis_code' => 'sometimes|string|max:20',
            'procedure_code' => 'sometimes|string|max:20',
            'amount_claimed' => 'sometimes|numeric|min:0.01',
            'notes' => 'sometimes|string',
        ]);

        $user = $request->user();

        $invoice = Invoice::findOrFail($request->invoice_id);

        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $claim = $this->claimService->createClaim($invoice, [
            'insurance_provider' => $request->insurance_provider,
            'policy_number' => $request->policy_number,
            'diagnosis_code' => $request->diagnosis_code,
            'procedure_code' => $request->procedure_code,
            'amount_claimed' => $request->amount_claimed,
        ]);

        if ($request->notes) {
            $claim->update(['notes' => $request->notes]);
        }

        return redirect()->route('billing.insurance-claims.index')
            ->with('success', 'Insurance claim created.');
    }

    public function show(InsuranceClaim $claim)
    {
        $user = request()->user();

        if ($user->role !== 'super_admin' && $claim->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $claim->load(['patient', 'invoice', 'appointment', 'invoice.items']);

        return Inertia::render('Billing/InsuranceClaims/Show', [
            'claim' => $claim,
        ]);
    }

    public function submit(InsuranceClaim $claim)
    {
        $user = request()->user();

        if ($user->role !== 'super_admin' && $claim->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        if ($claim->status !== 'draft') {
            return back()->withErrors(['status' => 'Only draft claims can be submitted.']);
        }

        $this->claimService->submitClaim($claim);

        return back()->with('success', 'Claim submitted to insurance provider.');
    }

    public function updateStatus(Request $request, InsuranceClaim $claim)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $claim->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'status' => 'required|in:under_review,approved,denied,paid',
            'amount_approved' => 'sometimes|numeric|min:0',
            'amount_paid' => 'sometimes|numeric|min:0',
            'denial_reason' => 'required_if:status,denied|nullable|string',
        ]);

        $this->claimService->updateClaimStatus(
            $claim,
            $request->status,
            $request->denial_reason
        );

        if ($request->filled('amount_approved')) {
            $claim->update(['amount_approved' => $request->amount_approved]);
        }

        if ($request->filled('amount_paid')) {
            $claim->update(['amount_paid' => $request->amount_paid]);
        }

        return back()->with('success', 'Claim status updated.');
    }

    public function agingReport(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $user->role !== 'clinic_admin') {
            abort(403, 'Unauthorized.');
        }

        $agingReport = $this->claimService->getClaimAgingReport($user->tenant_id);

        return Inertia::render('Billing/InsuranceClaims/AgingReport', [
            'agingReport' => $agingReport,
        ]);
    }
}