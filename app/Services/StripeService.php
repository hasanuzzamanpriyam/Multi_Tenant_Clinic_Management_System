<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;
use Stripe\PaymentMethod as StripePaymentMethod;
use Stripe\Refund;
use Stripe\Webhook;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\User;
use Exception;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCustomer(User $user): string
    {
        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
                'tenant_id' => $user->tenant_id,
            ],
        ]);

        return $customer->id;
    }

    public function createPaymentIntent(
        Invoice $invoice,
        string $paymentMethodId = null,
        string $customerId = null
    ): PaymentIntent {
        $amountInCents = (int) round($invoice->total * 100);

        $params = [
            'amount' => $amountInCents,
            'currency' => strtolower($invoice->currency ?? 'usd'),
            'metadata' => [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'patient_id' => $invoice->patient_id,
            ],
        ];

        if ($customerId) {
            $params['customer'] = $customerId;
        }

        if ($paymentMethodId) {
            $params['payment_method'] = $paymentMethodId;
            $params['confirmation_method'] = 'manual';
            $params['confirm'] = true;
        } else {
            $params['automatic_payment_methods'] = ['enabled' => true];
        }

        return PaymentIntent::create($params);
    }

    public function confirmPaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return PaymentIntent::retrieve($paymentIntentId)->confirm();
    }

    public function attachPaymentMethod(string $customerId, string $paymentMethodId): void
    {
        StripePaymentMethod::attach($paymentMethodId, ['customer' => $customerId]);
    }

    public function detachPaymentMethod(string $paymentMethodId): void
    {
        StripePaymentMethod::detach($paymentMethodId);
    }

    public function listPaymentMethods(string $customerId, string $type = 'card'): array
    {
        $paymentMethods = StripePaymentMethod::all([
            'customer' => $customerId,
            'type' => $type,
        ]);

        return $paymentMethods->data;
    }

    public function refundPayment(string $paymentIntentId, ?float $amount = null): Refund
    {
        $params = ['payment_intent' => $paymentIntentId];
        if ($amount) {
            $params['amount'] = (int) round($amount * 100);
        }

        return Refund::create($params);
    }

    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent(
            $payload,
            $sigHeader,
            config('services.stripe.webhook_secret')
        );
    }
}