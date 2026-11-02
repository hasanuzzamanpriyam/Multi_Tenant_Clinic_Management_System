<?php

return [

    'mode' => env('PAYPAL_MODE', 'sandbox'),

    'client_id' => env('PAYPAL_CLIENT_ID'),

    'client_secret' => env('PAYPAL_CLIENT_SECRET'),

    'webhook_id' => env('PAYPAL_WEBHOOK_ID'),

    'cert_path' => storage_path('app/certs'),

    'sandbox' => [
        'account' => env('PAYPAL_SANDBOX_ACCOUNT', 'sb-buyer@example.com'),
    ],

    'live' => [
        'account' => env('PAYPAL_LIVE_ACCOUNT'),
    ],

    'http' => [
        'verify' => env('PAYPAL_HTTP_VERIFY', true),
        'timeout' => env('PAYPAL_HTTP_TIMEOUT', 30),
        'headers' => [
            'PayPal-Partner-Attribution-Id' => env('PAYPAL_PARTNER_ATTRIBUTION_ID', 'ClinicPro_SP'),
        ],
    ],

];