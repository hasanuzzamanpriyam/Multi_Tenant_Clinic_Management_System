<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'super_admin' => Inertia::render('Dashboards/SuperAdmin'),
            'clinic_admin' => Inertia::render('Dashboards/ClinicAdmin'),
            'doctor' => Inertia::render('Dashboards/Doctor'),
            'patient' => Inertia::render('Dashboards/Patient'),
            default => Inertia::render('Dashboards/Default'),
        };
    }
}