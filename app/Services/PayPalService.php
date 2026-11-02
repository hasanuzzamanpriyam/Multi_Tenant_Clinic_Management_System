<?php

namespace App\Services;

use Srmklive\PayPal\Services\PayPal as PayPalClient;
use App\Models\Payment;
use App\Models\Invoice;
use Exception;

class PayPalService
{
    protected ?PayPalClient $client = null;

    public function __construct()
    {
        // Don't initialize client in constructor - do it lazily
    }

    protected function getClient(): ?PayPalClient
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $config = config('paypal');
        
        // Check if credentials are configured
        if (empty($config['client_id']) || empty($config['client_secret'])) {
            return null;
        }

        try {
            $this->client = new \Srmklive\PayPal\Services\PayPal();
            $this->client->setApiCredentials($config);
            $this->client->getAccessToken();
            return $this->client;
        } catch (\Exception $e) {
            \Log::warning('PayPal credentials not configured: ' . $e->getMessage());
            return null;
        }
    }

    public function isConfigured(): bool
    {
        return $this->getClient() !== null;
    }

    public function createOrder(Invoice $invoice, string $returnUrl, string $cancelUrl): ?array
    {
        $client = $this->getClient();
        
        if (!$client) {
            return null;
        }

        $amount = $invoice->total;

        $order = $client->createOrder([
            'intent' => 'CAPTURE',
            'application_context' => [
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'brand_name' => config('app.name'),
                'landing_page' => 'BILLING',
                'user_action' => 'PAY_NOW',
            ],
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => $invoice->currency ?? 'USD',
                        'value' => number_format($amount, 2, '.', ''),
                        'breakdown' => [
                            'item_total' => [
                                'currency_code' => $invoice->currency ?? 'USD',
                                'value' => number_format($invoice->subtotal, 2, '.', ''),
                            ],
                            'tax_total' => [
                                'currency_code' => $invoice->currency ?? 'USD',
                                'value' => number_format($invoice->tax_amount, 2, '.', ''),
                            ],
                            'discount' => [
                                'currency_code' => $invoice->currency ?? 'USD',
                                'value' => number_format($invoice->discount_amount, 2, '.', ''),
                            ],
                        ],
                    ],
                    'description' => "Invoice {$invoice->invoice_number}",
                    'custom_id' => (string) $invoice->id,
                    'reference_id' => $invoice->invoice_number,
                ],
            ],
        ]);

        return $order;
    }

    public function captureOrder(string $orderId): ?array
    {
        $client = $this->getClient();
        if (!$client) {
            return null;
        }
        return $client->capturePaymentOrder($orderId);
    }

    public function refundCapture(string $captureId, ?float $amount = null): ?array
    {
        $client = $this->getClient();
        if (!$client) {
            return null;
        }

        if ($amount) {
            return $client->refundOrder($captureId, [
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency_code' => 'USD',
                ],
            ]);
        }

        return $client->refundOrder($captureId);
    }

    public function verifyWebhookSignature(string $payload, array $headers): bool
    {
        $client = $this->getClient();
        if (!$client) {
            return false;
        }

        $webhookId = config('paypal.webhook_id');

        return $client->verifyWebhookSignature(
            $payload,
            $headers,
            $webhookId
        );
    }

    public function getCaptureDetails(string $captureId): ?array
    {
        $client = $this->getClient();
        if (!$client) {
            return null;
        }
        return $client->showCapturedPaymentDetails($captureId);
    }
}