<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Appointment;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\StripeService;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;
    protected StripeService $stripeService;
    protected PayPalService $payPalService;

    public function __construct(
        InvoiceService $invoiceService,
        StripeService $stripeService,
        PayPalService $payPalService
    ) {
        $this->invoiceService = $invoiceService;
        $this->stripeService = $stripeService;
        $this->payPalService = $payPalService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Invoice::with(['patient', 'appointment', 'payments'])
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $invoices = $query->latest()->paginate(15);

        return Inertia::render('Billing/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'patient_id']),
            'patients' => User::where('role', 'patient')
                ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
                ->get(['id', 'name']),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::with(['patient', 'doctor'])
            ->where('status', 'completed')
            ->where('billing_status', 'unbilled')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get();

        $patients = User::where('role', 'patient')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->get(['id', 'name']);

        return Inertia::render('Billing/Invoices/Create', [
            'appointments' => $appointments,
            'patients' => $patients,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'appointment_id' => 'sometimes|exists:appointments,id',
            'due_date' => 'sometimes|date|after_or_equal:today',
            'notes' => 'sometimes|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.taxable' => 'sometimes|boolean',
        ]);

        $user = $request->user();

        $invoice = $this->invoiceService->createFromAppointment(
            Appointment::findOrFail($request->appointment_id),
            $request->items
        );

        if ($request->due_date) {
            $invoice->update(['due_date' => $request->due_date]);
        }

        if ($request->notes) {
            $invoice->update(['notes' => $request->notes]);
        }

        // Update appointment billing status
        if ($invoice->appointment) {
            $invoice->appointment->update([
                'billing_status' => 'invoiced',
                'invoice_id' => $invoice->id,
            ]);
        }

        return redirect()->route('billing.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        $invoice->load(['items', 'patient', 'clinic', 'appointment', 'payments']);

        return Inertia::render('Billing/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        if ($invoice->status !== 'draft') {
            return back()->withErrors(['status' => 'Only draft invoices can be edited.']);
        }

        $invoice->load(['items', 'patient', 'appointment']);

        return Inertia::render('Billing/Invoices/Edit', [
            'invoice' => $invoice,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        if ($invoice->status !== 'draft') {
            return back()->withErrors(['status' => 'Only draft invoices can be edited.']);
        }

        $request->validate([
            'due_date' => 'sometimes|date|after_or_equal:today',
            'notes' => 'sometimes|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.taxable' => 'sometimes|boolean',
        ]);

        $invoice->update([
            'due_date' => $request->due_date,
            'notes' => $request->notes,
        ]);

        // Update items
        $invoice->items()->delete();
        foreach ($request->items as $index => $item) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $item['quantity'] * $item['unit_price'],
                'taxable' => $item['taxable'] ?? true,
                'sort_order' => $index,
            ]);
        }

        // Recalculate totals
        $subtotal = $invoice->items()->sum('total');
        $taxAmount = $subtotal * 0.1;
        $total = $subtotal + $taxAmount;

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
        ]);

        return back()->with('success', 'Invoice updated successfully.');
    }

    public function send(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        if ($invoice->status !== 'draft') {
            return back()->withErrors(['status' => 'Only draft invoices can be sent.']);
        }

        $this->invoiceService->sendInvoice($invoice);

        return back()->with('success', 'Invoice sent to patient.');
    }

    public function downloadPdf(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        $pdf = $this->invoiceService->generatePdf($invoice);

        return response()->streamDownload(
            fn () => print($pdf),
            "invoice-{$invoice->invoice_number}.pdf"
        );
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        if (!in_array($invoice->status, ['draft', 'cancelled'])) {
            return back()->withErrors(['status' => 'Cannot delete invoice in current status.']);
        }

        $invoice->delete();

        return redirect()->route('billing.invoices.index')
            ->with('success', 'Invoice deleted.');
    }

    public function createStripePaymentIntent(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        $paymentIntent = $this->stripeService->createPaymentIntent($invoice);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
        ]);
    }

    public function createPayPalOrder(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);

        if (! $this->payPalService->isConfigured()) {
            return response()->json([
                'error' => 'PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file.'
            ], 503);
        }

        $returnUrl = route('billing.payments.paypal.return', ['invoice' => $invoice]);
        $cancelUrl = route('billing.invoices.show', ['invoice' => $invoice]);

        $order = $this->payPalService->createOrder($invoice, $returnUrl, $cancelUrl);

        if (! $order) {
            return response()->json([
                'error' => 'Failed to create PayPal order.'
            ], 500);
        }

        return response()->json([
            'order_id' => $order['id'],
            'approval_url' => collect($order['links'])->firstWhere('rel', 'approve')['href'] ?? null,
        ]);
    }

    private function authorizeInvoice(Invoice $invoice): void
    {
        $user = request()->user();

        if ($user->role !== 'super_admin' && $invoice->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}