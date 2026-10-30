<?php

use App\Http\Controllers\ClinicAdminApprovalController;
use App\Http\Controllers\ClinicDoctorController;
use App\Http\Controllers\ClinicPatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorAppointmentController;
use App\Http\Controllers\DoctorAvailabilityController;
use App\Http\Controllers\PatientAppointmentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdminApprovalController;
use App\Http\Controllers\SuperAdminClinicController;
use App\Http\Controllers\SuperAdminUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/home', function () {
    return redirect('/dashboard');
})->name('home.alias');

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

/*
|--------------------------------------------------------------------------
| Shared Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - role-based rendering
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');

    // Two-factor authentication
    Route::get('/two-factor-authentication', fn () => Inertia::render('two-factor'))->name('two-factor');

    // Session management
    Route::get('/user/sessions', fn () => Inertia::render('sessions'))->name('sessions');

    // Logout
    Route::post('/logout', function () {
        auth()->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/login');
    })->name('logout');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes (role: super_admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    // Clinics
    Route::resource('clinics', SuperAdminClinicController::class);

    // Users
    Route::resource('users', SuperAdminUserController::class);

    // Approvals
    Route::get('approvals', [SuperAdminApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/{appointment}/approve', [SuperAdminApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('approvals/{appointment}/reject', [SuperAdminApprovalController::class, 'reject'])->name('approvals.reject');
});

/*
|--------------------------------------------------------------------------
| Clinic Admin Routes (role: clinic_admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:clinic_admin'])->prefix('clinic-admin')->name('clinic-admin.')->group(function () {
    // Approvals (Doctor Registrations)
    Route::get('approvals', [ClinicAdminApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/{doctor}/approve', [ClinicAdminApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('approvals/{doctor}/reject', [ClinicAdminApprovalController::class, 'reject'])->name('approvals.reject');

    // Doctors
    Route::resource('doctors', ClinicDoctorController::class);

    // Patients
    Route::resource('patients', ClinicPatientController::class);
});

/*
|--------------------------------------------------------------------------
| Doctor Routes (role: doctor)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:doctor'])->prefix('doctor')->name('doctor.')->group(function () {
    // Availability
    Route::resource('availability', DoctorAvailabilityController::class)->names('availability');

    // Appointments
    Route::get('appointments', [DoctorAppointmentController::class, 'index'])->name('appointments.index');
    Route::get('appointments/{appointment}', [DoctorAppointmentController::class, 'show'])->name('appointments.show');
    Route::match(['post', 'put'], 'appointments/{appointment}/confirm', [DoctorAppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::match(['post', 'put'], 'appointments/{appointment}/complete', [DoctorAppointmentController::class, 'complete'])->name('appointments.complete');
});

/*
|--------------------------------------------------------------------------
| Patient Routes (role: patient)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:patient'])->prefix('patient')->name('patient.')->group(function () {
    // Appointments
    Route::get('appointments', [PatientAppointmentController::class, 'index'])->name('appointments.index');
    Route::get('appointments/create', [PatientAppointmentController::class, 'create'])->name('appointments.create');
    Route::post('appointments', [PatientAppointmentController::class, 'store'])->name('appointments.store');
    Route::get('appointments/{appointment}', [PatientAppointmentController::class, 'show'])->name('appointments.show');
});
