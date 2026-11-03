<?php

use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BillingController as APIBillingController;
use App\Http\Controllers\API\DoctorController;
use App\Http\Controllers\API\TelemedicineController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ClinicAdminAppointmentController;
use App\Http\Controllers\ClinicAdminApprovalController;
use App\Http\Controllers\ClinicalRecordController;
use App\Http\Controllers\ClinicDoctorController;
use App\Http\Controllers\ClinicPatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorAppointmentController;
use App\Http\Controllers\DoctorAvailabilityController;
use App\Http\Controllers\DoctorReferralController;
use App\Http\Controllers\DoctorReviewController;
use App\Http\Controllers\DocumentUploadController;
use App\Http\Controllers\ImmunizationRecordController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\PatientAppointmentController;
use App\Http\Controllers\PatientRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\InsuranceClaimController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SuperAdminActivityController;
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
    Route::get('/two-factor-authentication', function () {
        $user = auth()->user();

        return Inertia::render('two-factor', [
            'twoFactorEnabled' => ! is_null($user->two_factor_secret) && ! is_null($user->two_factor_confirmed_at),
            'twoFactorPending' => ! is_null($user->two_factor_secret) && is_null($user->two_factor_confirmed_at),
        ]);
    })->name('two-factor');

    // Session management
    Route::get('/user/sessions', fn () => Inertia::render('sessions'))->name('sessions');

    // Settings shortcut
    Route::get('/settings', fn () => redirect()->route('profile'))->name('settings');

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

    // System Activity Log
    Route::get('activity', [SuperAdminActivityController::class, 'index'])->name('activity.index');
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
    Route::post('doctors/{doctor}/availability', [ClinicDoctorController::class, 'storeAvailability'])->name('doctors.availability.store');
    Route::put('doctors/{doctor}/availability/{availability}', [ClinicDoctorController::class, 'updateAvailability'])->name('doctors.availability.update');
    Route::delete('doctors/{doctor}/availability/{availability}', [ClinicDoctorController::class, 'destroyAvailability'])->name('doctors.availability.destroy');

    // Patients
    Route::resource('patients', ClinicPatientController::class);

    // Appointments
    Route::get('appointments', [ClinicAdminAppointmentController::class, 'index'])->name('appointments.index');
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

    // Medical Records, Prescriptions & Reports
    Route::get('records', [PatientRecordController::class, 'index'])->name('records.index');
    Route::get('prescriptions', [PatientRecordController::class, 'index'])->name('prescriptions.index');
    Route::get('reports', [PatientRecordController::class, 'index'])->name('reports.index');
    Route::post('reports/upload', [PatientRecordController::class, 'uploadReport'])->name('reports.upload');
    Route::get('documents/{document}/download', [PatientRecordController::class, 'downloadDocument'])->name('documents.download');
});

/*
|--------------------------------------------------------------------------
| Notification Preferences
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'edit'])->name('notification-preferences.edit');
    Route::put('/notification-preferences', [NotificationPreferenceController::class, 'update'])->name('notification-preferences.update');

    // Locale
    Route::get('/locale/{locale}', [LocaleController::class, 'set'])->name('locale.set');
});

/*
|--------------------------------------------------------------------------
| Calendar & Scheduling
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('calendar')->name('calendar.')->group(function () {
    Route::get('/', [CalendarController::class, 'index'])->name('index');
    Route::get('/events', [CalendarController::class, 'events'])->name('events');
    Route::post('/recurring', [CalendarController::class, 'storeRecurring'])->name('recurring.store');
    Route::post('/waitlist', [CalendarController::class, 'joinWaitlist'])->name('waitlist.join');
});

/*
|--------------------------------------------------------------------------
| Clinical Records
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('clinical')->name('clinical.')->group(function () {
    Route::get('medical-histories', [ClinicalRecordController::class, 'index'])->name('medical-histories.index');
    Route::post('medical-histories', [ClinicalRecordController::class, 'store'])->name('medical-histories.store');

    Route::get('lab-results', [LabResultController::class, 'index'])->name('lab-results.index');
    Route::post('lab-results', [LabResultController::class, 'store'])->name('lab-results.store');

    Route::get('documents', [DocumentUploadController::class, 'index'])->name('documents.index');
    Route::post('documents', [DocumentUploadController::class, 'store'])->name('documents.store');
    Route::get('documents/{document}/download', [DocumentUploadController::class, 'download'])->name('documents.download');

    Route::get('immunizations', [ImmunizationRecordController::class, 'index'])->name('immunizations.index');
    Route::post('immunizations', [ImmunizationRecordController::class, 'store'])->name('immunizations.store');

    Route::get('referrals', [DoctorReferralController::class, 'index'])->name('referrals.index');
    Route::post('referrals', [DoctorReferralController::class, 'store'])->name('referrals.store');
    Route::post('referrals/{referral}/moderate', [DoctorReferralController::class, 'update'])->name('referrals.moderate');
});

/*
|--------------------------------------------------------------------------
| Inventory
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::get('medicines', [MedicineController::class, 'index'])->name('medicines.index');
    Route::post('medicines', [MedicineController::class, 'store'])->name('medicines.store');

    Route::get('stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('stock', [StockController::class, 'store'])->name('stock.store');
    Route::put('stock/{stock}', [StockController::class, 'update'])->name('stock.update');

    Route::get('low-stock-alerts', [InventoryController::class, 'lowStockAlerts'])->name('low-stock-alerts.index');
    Route::post('low-stock-alerts/{alert}/resolve', [InventoryController::class, 'resolveAlert'])->name('low-stock-alerts.resolve');
});

/*
|--------------------------------------------------------------------------
| Doctor Reviews
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('doctor-reviews')->name('doctor-reviews.')->group(function () {
    Route::get('/', [DoctorReviewController::class, 'index'])->name('index');
    Route::post('/', [DoctorReviewController::class, 'store'])->name('store');
    Route::post('/{review}/moderate', [DoctorReviewController::class, 'moderate'])->name('moderate');
});

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('reports')->name('reports.')->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('index');
    Route::get('export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
    Route::get('export/csv', [ReportController::class, 'exportCsv'])->name('export.csv');
});

/*
|--------------------------------------------------------------------------
| Billing & Payments
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('billing')->name('billing.')->group(function () {
    // Dashboard
    Route::get('/', [BillingController::class, 'dashboard'])->name('dashboard');
    Route::get('patient-statements', [BillingController::class, 'patientStatements'])->name('patient-statements');
    Route::get('doctor-earnings', [BillingController::class, 'doctorEarnings'])->name('doctor-earnings');
    Route::get('aging-report', [BillingController::class, 'agingReport'])->name('aging-report');
    Route::get('aging-report/pdf', [BillingController::class, 'exportAgingPdf'])->name('aging-report.pdf');

    // Invoices
    Route::resource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf'])->name('invoices.pdf');
    Route::post('invoices/{invoice}/stripe-payment-intent', [InvoiceController::class, 'createStripePaymentIntent'])->name('invoices.stripe-payment-intent');
    Route::post('invoices/{invoice}/paypal-order', [InvoiceController::class, 'createPayPalOrder'])->name('invoices.paypal-order');

    // Payments
    Route::resource('payments', PaymentController::class);
    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund'])->name('payments.refund');
    Route::get('payments/stripe/callback', [PaymentController::class, 'stripeCallback'])->name('payments.stripe.callback');
    Route::get('payments/paypal/return', [PaymentController::class, 'paypalReturn'])->name('payments.paypal.return');

    // Insurance Claims
    Route::resource('insurance-claims', InsuranceClaimController::class);
    Route::post('insurance-claims/{claim}/submit', [InsuranceClaimController::class, 'submit'])->name('insurance-claims.submit');
    Route::post('insurance-claims/{claim}/status', [InsuranceClaimController::class, 'updateStatus'])->name('insurance-claims.status');
    Route::get('insurance-claims/aging-report', [InsuranceClaimController::class, 'agingReport'])->name('insurance-claims.aging-report');

    // Payment Methods
    Route::resource('payment-methods', PaymentMethodController::class);
    Route::post('payment-methods/{method}/default', [PaymentMethodController::class, 'setDefault'])->name('payment-methods.default');

    // Patient Statements
    Route::get('patient-statements', [BillingController::class, 'patientStatements'])->name('patient-statements');
    Route::get('doctor-earnings', [BillingController::class, 'doctorEarnings'])->name('doctor-earnings');
    Route::get('aging-report', [BillingController::class, 'agingReport'])->name('aging-report');
    Route::get('aging-report/pdf', [BillingController::class, 'exportAgingPdf'])->name('aging-report.pdf');
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api/v1')->name('api.')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('appointments', AppointmentController::class);
        Route::get('doctors', [DoctorController::class, 'index'])->name('doctors.index');
        Route::post('telemedicine/session', [TelemedicineController::class, 'createSession'])->name('telemedicine.session');
        Route::get('telemedicine/session/{appointment}/join', [TelemedicineController::class, 'joinUrl'])->name('telemedicine.join');

        // Billing API
        Route::post('billing/payment-intent', [APIBillingController::class, 'createPaymentIntent'])->name('billing.payment-intent');
        Route::post('billing/paypal-order', [APIBillingController::class, 'createPayPalOrder'])->name('billing.paypal-order');
        Route::post('billing/webhooks/stripe', [APIBillingController::class, 'stripeWebhook'])->name('billing.webhooks.stripe');
        Route::post('billing/webhooks/paypal', [APIBillingController::class, 'paypalWebhook'])->name('billing.webhooks.paypal');
        Route::post('billing/invoices', [APIBillingController::class, 'createInvoice'])->name('billing.invoices.store');
        Route::get('billing/invoices/{invoice}', [APIBillingController::class, 'getInvoice'])->name('billing.invoices.show');
        Route::post('billing/invoices/{invoice}/send', [APIBillingController::class, 'sendInvoice'])->name('billing.invoices.send');
        Route::post('billing/insurance-claims', [APIBillingController::class, 'createInsuranceClaim'])->name('billing.insurance-claims.store');
        Route::post('billing/insurance-claims/{claim}/submit', [APIBillingController::class, 'submitInsuranceClaim'])->name('billing.insurance-claims.submit');
        Route::post('billing/insurance-claims/{claim}/status', [APIBillingController::class, 'updateInsuranceClaimStatus'])->name('billing.insurance-claims.status');
        Route::get('billing/revenue-report', [APIBillingController::class, 'getRevenueReport'])->name('billing.revenue-report');
        Route::get('billing/patient-statement/{patient}', [APIBillingController::class, 'getPatientStatement'])->name('billing.patient-statement');
    });
});
