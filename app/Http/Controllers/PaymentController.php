<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Appointment;
use App\Models\User;
use App\Services\StripeService;
use App\Services\PayPalService;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected StripeService $stripeService;
    protected PayPalService $payPalService;
    protected InvoiceService $invoiceService;

    public function __construct(
        StripeService $stripeService,
        PayPalService $payPalService,
        InvoiceService $invoiceService
    ) {
        $this->stripeService = $stripeService;
        $this->payPalService = $payPalService;
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Payment::with(['invoice', 'patient', 'appointment'])
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $payments = $query->latest('paid_at')->paginate(15);

        return Inertia::render('Billing/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'payment_method', 'patient_id']),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $invoices = Invoice::with(['patient', 'appointment'])
            ->whereIn('status', ['sent', 'partially_paid'])
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get();

        $patients = User::where('role', 'patient')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get(['id', 'name']);

        $appointments = \App\Models\Appointment::with(['patient', 'doctor'])
            ->where('status', 'completed')
            ->where('billing_status', '!=', 'paid')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get();

        return Inertia::render('Billing/Payments/Create', [
            'invoices' => $invoices,
            'patients' => $patients,
            'appointments' => $appointments,
            'paymentMethods' => ['cash', 'card', 'bank_transfer', 'insurance'],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'patient_id' => 'required|exists:users,id',
            'appointment_id' => 'sometimes|exists:appointments,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'sometimes|string|size:3',
            'payment_method' => 'required|in:stripe,paypal,cash,card,insurance,bank_transfer',
            'transaction_id' => 'sometimes|string',
            'notes' => 'sometimes|string',
        ]);

        $user = $request->user();

        $invoice = Invoice::findOrFail($request->invoice_id);

        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $payment = Payment::create([
            'tenant_id' => $invoice->tenant_id,
            'invoice_id' => $invoice->id,
            'patient_id' => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'amount' => $request->amount,
            'currency' => $request->currency ?? 'USD',
            'payment_method' => $request->payment_method,
            'transaction_id' => $request->transaction_id,
            'status' => 'completed',
            'paid_at' => now(),
            'metadata' => ['notes' => $request->notes, 'entered_by' => $user->id],
        ]);

        // Update invoice status
        $this->updateInvoiceStatus($invoice);

        // Update appointment billing status
        if ($invoice->appointment) {
            $this->updateAppointmentBillingStatus($invoice->appointment);
        }

        return redirect()->route('billing.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    public function stripeCallback(Request $request)
    {
        $request->validate([
            'payment_intent' => 'required|string',
        ]);

        $paymentIntentId = $request->payment_intent;

        try {
            $paymentIntent = $this->stripeService->confirmPaymentIntent($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                $invoiceId = $paymentIntent->metadata->invoice_id ?? null;

                if ($invoiceId) {
                    $invoice = Invoice::find($invoiceId);

                    if ($invoice) {
                        Payment::create([
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
                        ]);

                        $this->updateInvoiceStatus($invoice);
                        if ($invoice->appointment) {
                            $this->updateAppointmentBillingStatus($invoice->appointment);
                        }
                    }
                }

                return redirect()->route('billing.invoices.index')
                    ->with('success', 'Payment completed successfully.');
            }

            return redirect()->route('billing.invoices.index')
                ->with('error', 'Payment failed.');

        } catch (\Exception $e) {
            return redirect()->route('billing.invoices.index')
                ->with('error', 'Payment processing error: ' . $e->getMessage());
        }
    }

    public function paypalReturn(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'invoice' => 'required|integer',
        ]);

        $invoice = Invoice::findOrFail($request->invoice);

        try {
            $order = $this->payPalService->captureOrder($request->token);

            if ($order['status'] === 'COMPLETED') {
                $capture = collect($order['purchase_units'][0]['payments']['captures'])->first();

                Payment::create([
                    'tenant_id' => $invoice->tenant_id,
                    'invoice_id' => $invoice->id,
                    'patient_id' => $invoice->patient_id,
                    'appointment_id' => $invoice->appointment_id,
                    'amount' => $capture['amount']['value'],
                    'currency' => $capture['amount']['currency_code'],
                    'payment_method' => 'paypal',
                    'transaction_id' => $capture['id'],
                    'gateway_response' => $order,
                    'status' => 'completed',
                    'paid_at' => now(),
                ]);

                $this->updateInvoiceStatus($invoice);
                if ($invoice->appointment) {
                    $this->updateAppointmentBillingStatus($invoice->appointment);
                }

                return redirect()->route('billing.invoices.index')
                    ->with('success', 'Payment completed successfully.');
            }

            return redirect()->route('billing.invoices.index')
                ->with('error', 'Payment could not be completed.');

        } catch (\Exception $e) {
            return redirect()->route('billing.invoices.index')
                ->with('error', 'Payment processing error: ' . $e->getMessage());
        }
    }

    public function refund(Request $request, Payment $payment)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin' && $payment->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        if ($payment->status !== 'completed') {
            return back()->withErrors(['status' => 'Only completed payments can be refunded.']);
        }

        $request->validate([
            'amount' => 'sometimes|numeric|min:0.01|max:' . $payment->amount,
            'reason' => 'sometimes|string',
        ]);

        $amount = $request->amount ?? $payment->amount;

        try {
            if ($payment->payment_method === 'stripe' && $payment->transaction_id) {
                $this->stripeService->refundPayment($payment->transaction_id, $amount);
            } elseif ($payment->payment_method === 'paypal' && $payment->transaction_id) {
                if (! $this->payPalService->isConfigured()) {
                    return back()->withErrors(['error' => 'PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file.']);
                }
                $this->payPalService->refundCapture($payment->transaction_id, $amount);
            }

            if ($amount >= $payment->amount) {
                $payment->update(['status' => 'refunded']);
            } else {
                $payment->update(['status' => 'partially_refunded']);
            }

            $payment->update(['metadata' => array_merge(
                $payment->metadata ?? [],
                ['refund_reason' => $request->reason, 'refunded_by' => $user->id, 'refunded_at' => now()->toISOString()]
            )]);

            // Update invoice status after refund
            if ($payment->invoice) {
                $this->updateInvoiceStatus($payment->invoice);
            }

            return back()->with('success', 'Refund processed successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Refund failed: ' . $e->getMessage()]);
        }
    }

    protected function updateInvoiceStatus(Invoice $invoice): void
    {
        $totalPaid = $invoice->payments()
            ->where('status', 'completed')
            ->sum('amount');

        if ($totalPaid >= $invoice->total) {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
            $this->invoiceService->markAsPaid($invoice);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partially_paid']);
            $this->invoiceService->markAsPartiallyPaid($invoice);
        }
    }

    protected function updateAppointmentBillingStatus(Appointment $appointment): void
    {
        $invoice = $appointment->invoice;

        if ($invoice) {
            $totalPaid = $invoice->payments()
                ->where('status', 'completed')
                ->sum('amount');

            if ($totalPaid >= $invoice->total) {
                $appointment->update(['billing_status' => 'paid']);
            } elseif ($totalPaid > 0) {
                $appointment->update(['billing_status' => 'partially_paid']);
            } else {
                $appointment->update(['billing_status' => 'invoiced']);
            }
        }
    }
}