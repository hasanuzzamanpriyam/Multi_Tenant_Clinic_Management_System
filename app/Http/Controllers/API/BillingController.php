<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\InsuranceClaim;
use App\Services\StripeService;
use App\Services\PayPalService;
use App\Services\InvoiceService;
use App\Services\InsuranceClaimService;
use App\Services\BillingReportService;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    protected StripeService $stripeService;
    protected PayPalService $payPalService;
    protected InvoiceService $invoiceService;
    protected InsuranceClaimService $claimService;
    protected BillingReportService $reportService;

    public function __construct(
        StripeService $stripeService,
        PayPalService $payPalService,
        InvoiceService $invoiceService,
        InsuranceClaimService $claimService,
        BillingReportService $reportService
    ) {
        $this->stripeService = $stripeService;
        $this->payPalService = $payPalService;
        $this->invoiceService = $invoiceService;
        $this->claimService = $claimService;
        $this->reportService = $reportService;
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);

        // Check tenant isolation
        $user = $request->user();
        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $paymentIntent = $this->stripeService->createPaymentIntent($invoice);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
            'payment_intent_id' => $paymentIntent->id,
        ]);
    }

    public function createPayPalOrder(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);

        $user = $request->user();
        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $returnUrl = $request->input('return_url', route('billing.payments.paypal.return', ['invoice' => $invoice]));
        $cancelUrl = $request->input('cancel_url', route('api.billing.invoice.show', ['invoice' => $invoice]));

        $order = $this->payPalService->createOrder($invoice, $returnUrl, $cancelUrl);

        $approvalUrl = collect($order['links'])->firstWhere('rel', 'approve')['href'] ?? null;

        return response()->json([
            'order_id' => $order['id'],
            'approval_url' => $approvalUrl,
        ]);
    }

    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Webhook signature verification failed'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;
            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;
        }

        return response()->json(['received' => true]);
    }

    public function paypalWebhook(Request $request)
    {
        $payload = $request->getContent();
        $headers = $request->headers->all();

        if (!$this->payPalService->verifyWebhookSignature($payload, $headers)) {
            return response()->json(['error' => 'Invalid webhook signature'], 400);
        }

        $event = json_decode($payload, true);

        switch ($event['event_type'] ?? '') {
            case 'PAYMENT.CAPTURE.COMPLETED':
                $this->handlePayPalCaptureCompleted($event['resource']);
                break;
            case 'PAYMENT.CAPTURE.DENIED':
                $this->handlePayPalCaptureDenied($event['resource']);
                break;
            case 'PAYMENT.CAPTURE.REFUNDED':
                $this->handlePayPalRefunded($event['resource']);
                break;
        }

        return response()->json(['received' => true]);
    }

    public function createInvoice(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'items' => 'sometimes|array',
        ]);

        $appointment = \App\Models\Appointment::findOrFail($request->appointment_id);

        $user = $request->user();
        if ($user->role !== 'super_admin' && $appointment->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $items = $request->input('items', []);
        $invoice = $this->invoiceService->createFromAppointment($appointment, $items);

        $appointment->update([
            'billing_status' => 'invoiced',
            'invoice_id' => $invoice->id,
        ]);

        return response()->json($invoice->load('items'), 201);
    }

    public function getInvoice(Request $request, Invoice $invoice)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($invoice->load(['items', 'patient', 'clinic', 'payments']));
    }

    public function sendInvoice(Request $request, Invoice $invoice)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Only draft invoices can be sent.'], 400);
        }

        $this->invoiceService->sendInvoice($invoice);

        return response()->json($invoice->fresh());
    }

    public function createInsuranceClaim(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'insurance_provider' => 'required|string',
            'policy_number' => 'required|string',
            'diagnosis_code' => 'sometimes|string',
            'procedure_code' => 'sometimes|string',
            'amount_claimed' => 'sometimes|numeric',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);

        $user = $request->user();
        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $claim = $this->claimService->createClaim($invoice, [
            'insurance_provider' => $request->insurance_provider,
            'policy_number' => $request->policy_number,
            'diagnosis_code' => $request->diagnosis_code,
            'procedure_code' => $request->procedure_code,
            'amount_claimed' => $request->amount_claimed,
        ]);

        return response()->json($claim, 201);
    }

    public function submitInsuranceClaim(Request $request, InsuranceClaim $claim)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $claim->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($claim->status !== 'draft') {
            return response()->json(['message' => 'Only draft claims can be submitted.'], 400);
        }

        $this->claimService->submitClaim($claim);

        return response()->json($claim->fresh());
    }

    public function updateInsuranceClaimStatus(Request $request, InsuranceClaim $claim)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $claim->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'status' => 'required|in:under_review,approved,denied,paid',
            'amount_approved' => 'sometimes|numeric',
            'amount_paid' => 'sometimes|numeric',
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

        return response()->json($claim->fresh());
    }

    public function getRevenueReport(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->role === 'super_admin' ? $request->get('tenant_id') : $user->tenant_id;

        if (!$tenantId) {
            return response()->json(['message' => 'Tenant ID required.'], 400);
        }

        $period = $request->get('period', 'month');

        $summary = $this->reportService->getRevenueSummary($tenantId, $period);
        $paymentReport = $this->reportService->getPaymentCollectionReport($tenantId, $period);
        $agingReport = $this->reportService->getAgingReport($tenantId);
        $insuranceSummary = $this->reportService->getInsuranceClaimSummary($tenantId);
        $doctorEarnings = $this->reportService->getDoctorEarnings($tenantId, $period);

        return response()->json([
            'revenue_summary' => $summary,
            'payment_report' => $paymentReport,
            'aging_report' => $agingReport,
            'insurance_summary' => $insuranceSummary,
            'doctor_earnings' => $doctorEarnings,
            'period' => $period,
        ]);
    }

    public function getPatientStatement(Request $request, $patientId)
    {
        $user = $request->user();
        $tenantId = $user->role === 'super_admin' ? $request->get('tenant_id') : $user->tenantId;

        $patient = \App\Models\User::findOrFail($patientId);

        if ($user->role !== 'super_admin' && $patient->tenant_id !== $user->tenant_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $invoices = Invoice::where('patient_id', $patientId)
            ->whereIn('status', ['sent', 'partially_paid', 'overdue', 'paid'])
            ->with('payments')
            ->get();

        $totalInvoiced = $invoices->sum('total');
        $totalPaid = $invoices->flatMap->payments->where('status', 'completed')->sum('amount');
        $balance = $invoices->sum('balance');

        return response()->json([
            'patient' => $patient,
            'total_invoiced' => $totalInvoiced,
            'total_paid' => $totalPaid,
            'balance' => $balance,
            'invoices' => $invoices,
        ]);
    }

    // Private handler methods
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $invoiceId = $paymentIntent->metadata->invoice_id ?? null;

        if ($invoiceId) {
            $invoice = Invoice::find($invoiceId);

            if ($invoice) {
                Payment::updateOrCreate(
                    ['transaction_id' => $paymentIntent->id],
                    [
                        'tenant_id' => $invoice->tenant_id,
                        'invoice_id' => $invoice->id,
                        'patient_id' => $invoice->patient_id,
                        'appointment_id' => $invoice->appointment_id,
                        'amount' => $paymentIntent->amount / 100,
                        'currency' => strtoupper($paymentIntent->currency),
                        'payment_method' => 'stripe',
                        'transaction_id' => $paymentIntent->id,
                        'gateway_response' => $paymentIntent->toArray(),
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]
                );

                $this->updateInvoiceStatus($invoice);
            }
        }
    }

    protected function handlePaymentIntentFailed($paymentIntent)
    {
        // Log failed payment, send notification
        \Log::warning('Stripe payment failed', [
            'payment_intent_id' => $paymentIntent->id,
            'error' => $paymentIntent->last_payment_error ?? 'Unknown error',
        ]);
    }

    protected function handleChargeRefunded($charge)
    {
        // Update payment record
        Payment::where('transaction_id', $charge->payment_intent)
            ->where('payment_method', 'stripe')
            ->update(['status' => 'refunded']);

        $payment = Payment::where('transaction_id', $charge->payment_intent)
            ->where('payment_method', 'stripe')
            ->first();

        if ($payment && $payment->invoice) {
            $this->updateInvoiceStatus($payment->invoice);
        }
    }

    protected function handlePayPalCaptureCompleted($resource)
    {
        $customId = $resource['custom_id'] ?? null;

        if ($customId) {
            $invoice = Invoice::find($customId);

            if ($invoice) {
                $capture = $resource['supplementary_data'] ?? [];
                $amount = $resource['amount']['value'] ?? 0;

                Payment::updateOrCreate(
                    ['transaction_id' => $resource['id']],
                    [
                        'tenant_id' => $invoice->tenant_id,
                        'invoice_id' => $invoice->id,
                        'patient_id' => $invoice->patient_id,
                        'appointment_id' => $invoice->appointment_id,
                        'amount' => $amount,
                        'currency' => $resource['amount']['currency_code'] ?? 'USD',
                        'payment_method' => 'paypal',
                        'transaction_id' => $resource['id'],
                        'gateway_response' => $resource,
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]
                );

                $this->updateInvoiceStatus($invoice);
            }
        }
    }

    protected function handlePayPalCaptureDenied($resource)
    {
        \Log::warning('PayPal payment denied', [
            'resource' => $resource,
        ]);
    }

    protected function handlePayPalRefunded($resource)
    {
        $payment = Payment::where('transaction_id', $resource['id'])
            ->where('payment_method', 'paypal')
            ->first();

        if ($payment) {
            $payment->update(['status' => 'refunded']);

            if ($payment->invoice) {
                $this->updateInvoiceStatus($payment->invoice);
            }
        }
    }

    protected function updateInvoiceStatus(Invoice $invoice): void
    {
        $totalPaid = $invoice->payments()
            ->where('status', 'completed')
            ->sum('amount');

        if ($totalPaid >= $invoice->total) {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partially_paid']);
        }
    }
}