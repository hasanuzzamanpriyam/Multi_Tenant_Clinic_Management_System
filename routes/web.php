<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Guest authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');
    Route::get('/register', fn () => Inertia::render('auth/register'))->name('register');
    Route::get('/forgot-password', fn () => Inertia::render('auth/forgot-password'))->name('password.request');
    Route::get('/reset-password/{token}', fn ($request, $token) => Inertia::render('auth/reset-password', [
        'email' => $request->input('email'),
        'token' => $token,
    ]))->name('password.reset');
    Route::get('/verify-email', fn () => Inertia::render('auth/verify-email'))->name('verification.notice');
    Route::get('/confirm-password', fn () => Inertia::render('auth/confirm-password'))->name('password.confirm');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    })->name('dashboard');

    // Profile routes
    Route::get('/profile', function () {
        return Inertia::render('profile');
    })->name('profile');

    // Two-factor authentication routes
    Route::get('/two-factor-authentication', function () {
        return Inertia::render('two-factor');
    })->name('two-factor');

    // Session management routes
    Route::get('/user/sessions', function () {
        return Inertia::render('sessions');
    })->name('sessions');
});