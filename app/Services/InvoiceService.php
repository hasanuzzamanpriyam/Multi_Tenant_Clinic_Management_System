<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Appointment;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;

class InvoiceService
{
    public function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $lastInvoice = Invoice::where('invoice_number', 'like', "{$prefix}{$date}%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        $sequence = 1;
        if ($lastInvoice) {
            $lastSequence = (int) substr($lastInvoice->invoice_number, -4);
            $sequence = $lastSequence + 1;
        }

        return "{$prefix}{$date}" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function createFromAppointment(Appointment $appointment, array $items = []): Invoice
    {
        $invoice = Invoice::create([
            'tenant_id' => $appointment->tenant_id,
            'patient_id' => $appointment->patient_id,
            'appointment_id' => $appointment->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'status' => 'draft',
            'due_date' => now()->addDays(30),
            'currency' => 'USD',
        ]);

        // Add default items from appointment if no custom items provided
        if (empty($items)) {
            $items = $this->getDefaultItemsForAppointment($appointment);
        }

        $subtotal = 0;
        foreach ($items as $index => $item) {
            $total = $item['quantity'] * $item['unit_price'];
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $total,
                'taxable' => $item['taxable'] ?? true,
                'sort_order' => $index,
            ]);
            $subtotal += $total;
        }

        $taxAmount = $subtotal * 0.1; // 10% tax
        $total = $subtotal + $taxAmount;

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
        ]);

        return $invoice->load('items');
    }

    public function sendInvoice(Invoice $invoice): bool
    {
        if ($invoice->status !== 'draft') {
            return false;
        }

        $invoice->update(['status' => 'sent']);

        // TODO: Send email notification to patient
        // $invoice->patient->notify(new InvoiceSent($invoice));

        return true;
    }

    public function generatePdf(Invoice $invoice): string
    {
        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice->load(['items', 'patient', 'clinic']),
        ]);

        return $pdf->output();
    }

    public function downloadPdf(Invoice $invoice): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice->load(['items', 'patient', 'clinic']),
        ]);

        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }

    public function markAsPaid(Invoice $invoice): void
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // Update appointment billing status
        if ($invoice->appointment) {
            $invoice->appointment->update(['billing_status' => 'paid']);
        }
    }

    public function markAsPartiallyPaid(Invoice $invoice): void
    {
        $invoice->update(['status' => 'partially_paid']);

        if ($invoice->appointment) {
            $invoice->appointment->update(['billing_status' => 'partially_paid']);
        }
    }

    public function markAsOverdue(Invoice $invoice): void
    {
        if ($invoice->status === 'sent') {
            $invoice->update(['status' => 'overdue']);
        }
    }

    protected function getDefaultItemsForAppointment(Appointment $appointment): array
    {
        $items = [
            [
                'description' => 'Consultation Fee',
                'quantity' => 1,
                'unit_price' => 100.00,
                'taxable' => true,
            ],
        ];

        // Add prescription items if any
        if ($appointment->prescriptions->isNotEmpty()) {
            foreach ($appointment->prescriptions as $prescription) {
                $items[] = [
                    'description' => "Medication: {$prescription->medicine_name}",
                    'quantity' => 1,
                    'unit_price' => 25.00,
                    'taxable' => true,
                ];
            }
        }

        return $items;
    }

    public function getOverdueInvoices(int $tenantId): \Illuminate\Database\Eloquent\Collection
    {
        return Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['sent', 'partially_paid'])
            ->where('due_date', '<', now())
            ->get();
    }
}