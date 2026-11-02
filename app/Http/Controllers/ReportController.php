<?php

namespace App\Http\Controllers;

use App\Exports\AppointmentsExport;
use App\Models\Appointment;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Appointment::with(['patient', 'doctor']);

        if ($user->role === 'super_admin') {
            // all
        } else {
            $query->where('tenant_id', $user->tenant_id);
        }

        $totalAppointments = $query->count();
        $completedAppointments = $query->where('status', 'completed')->count();
        $pendingAppointments = $query->where('status', 'pending')->count();
        $cancelledAppointments = $query->where('status', 'cancelled')->count();
        $noShowRate = $totalAppointments > 0
            ? round((($cancelledAppointments) / $totalAppointments) * 100, 2)
            : 0;

        $doctorUtilization = User::where('role', 'doctor')
            ->when($user->role !== 'super_admin', fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->withCount('doctorAppointments')
            ->orderByDesc('doctor_appointments_count')
            ->limit(10)
            ->get();

        $monthlyData = $query->whereBetween('appointment_date', [
            now()->subMonths(6)->startOfMonth(),
            now()->endOfMonth(),
        ])
            ->selectRaw('MONTH(appointment_date) as month, YEAR(appointment_date) as year, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return inertia('Reports/Index', [
            'stats' => [
                'total' => $totalAppointments,
                'completed' => $completedAppointments,
                'pending' => $pendingAppointments,
                'cancelled' => $cancelledAppointments,
                'no_show_rate' => $noShowRate,
            ],
            'doctorUtilization' => $doctorUtilization,
            'monthlyData' => $monthlyData,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();

        $query = Appointment::with(['patient', 'doctor']);

        if ($user->role !== 'super_admin') {
            $query->where('tenant_id', $user->tenant_id);
        }

        $appointments = $query->get();

        $pdf = Pdf::loadView('reports.pdf', [
            'appointments' => $appointments,
            'user' => $user,
        ]);

        return $pdf->download('clinic-report-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportCsv(Request $request)
    {
        return Excel::download(new AppointmentsExport($user), 'clinic-report-'.now()->format('Y-m-d').'.csv');
    }
}
