<?php

namespace App\Exports;

use App\Models\Appointment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AppointmentsExport implements FromCollection, WithHeadings
{
    protected $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function collection()
    {
        $query = Appointment::with(['patient', 'doctor', 'clinic']);

        if ($this->user && $this->user->role !== 'super_admin') {
            $query->where('tenant_id', $this->user->tenant_id);
        }

        return $query->get()->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'patient' => $appointment->patient?->name,
                'doctor' => $appointment->doctor?->name,
                'clinic' => $appointment->clinic?->name,
                'date' => $appointment->appointment_date,
                'time' => $appointment->appointment_time,
                'status' => $appointment->status,
                'priority' => $appointment->priority,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Patient',
            'Doctor',
            'Clinic',
            'Date',
            'Time',
            'Status',
            'Priority',
        ];
    }
}
