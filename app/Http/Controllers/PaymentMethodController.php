<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $methods = PaymentMethod::where('patient_id', $user->id)
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->orderByDesc('is_default')
            ->get();

        return Inertia::render('Billing/PaymentMethods/Index', [
            'methods' => $methods,
            'stripePublishableKey' => config('services.stripe.key'),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'type' => 'required|in:stripe,paypal',
            'payment_method_id' => 'required_if:type,stripe|string',
            'gateway_customer_id' => 'sometimes|string',
        ]);

        if ($request->type === 'stripe') {
            $paymentMethod = $this->stripeService->attachPaymentMethod(
                $request->gateway_customer_id,
                $request->payment_method_id
            );

            $details = $paymentMethod->card ?? [];

            $method = PaymentMethod::create([
                'tenant_id' => $user->tenant_id,
                'patient_id' => $user->id,
                'type' => 'stripe',
                'gateway_customer_id' => $request->gateway_customer_id,
                'gateway_payment_method_id' => $request->payment_method_id,
                'brand' => $details['brand'] ?? null,
                'last4' => $details['last4'] ?? null,
                'exp_month' => $details['exp_month'] ?? null,
                'exp_year' => $details['exp_year'] ?? null,
                'is_default' => false,
            ]);

            return response()->json(['method' => $method]);
        }

        return response()->json(['error' => 'PayPal payment methods not yet supported'], 400);
    }

    public function setDefault(Request $request, PaymentMethod $method)
    {
        $user = $request->user();

        if ($method->patient_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        PaymentMethod::where('patient_id', $user->id)
            ->update(['is_default' => false]);

        $method->update(['is_default' => true]);

        return response()->json(['success' => true]);
    }

    public function destroy(PaymentMethod $method)
    {
        $user = request()->user();

        if ($method->patient_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        if ($method->type === 'stripe' && $method->gateway_payment_method_id) {
            $this->stripeService->detachPaymentMethod($method->gateway_payment_method_id);
        }

        $method->delete();

        return response()->json(['success' => true]);
    }
}