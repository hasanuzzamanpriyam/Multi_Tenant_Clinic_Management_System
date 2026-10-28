<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clinics = Clinic::all();

        if ($clinics->isEmpty()) {
            $this->command->warn('No clinics found. Run ClinicSeeder first.');
            return;
        }

        foreach ($clinics as $clinic) {
            $doctors = User::where('tenant_id', $clinic->id)
                ->where('role', 'doctor')
                ->get();

            $patients = User::where('tenant_id', $clinic->id)
                ->where('role', 'patient')
                ->get();

            if ($doctors->isEmpty() || $patients->isEmpty()) {
                continue;
            }

            // Create appointments for the next 30 days
            $startDate = Carbon::now()->startOfDay();
            $endDate = Carbon::now()->addDays(30);

            $statuses = ['pending', 'approved', 'completed', 'cancelled'];
            $appointmentTypes = ['Check-up', 'Follow-up', 'Consultation', 'New Patient', 'Annual Check-up'];

            // Create 15-25 appointments per clinic
            $appointmentCount = rand(15, 25);

            for ($i = 0; $i < $appointmentCount; $i++) {
                $doctor = $doctors->random();
                $patient = $patients->random();

                // Random date within 30 days
                $appointmentDate = $startDate->copy()->addDays(rand(0, 30));
                
                // Random time between 9 AM and 5 PM
                $hour = rand(9, 16);
                $minute = [0, 15, 30, 45][array_rand([0, 15, 30, 45])];
                $appointmentTime = sprintf('%02d:%02d:00', $hour, $minute);

                $status = $statuses[array_rand($statuses)];
                $completedAt = null;
                $cancelledAt = null;

                if ($status === 'completed') {
                    $completedAt = $appointmentDate->copy()->setTime($hour, $minute)->addMinutes(rand(15, 60));
                } elseif ($status === 'cancelled') {
                    $cancelledAt = $appointmentDate->copy()->subDays(rand(0, 3))->setTime(rand(9, 17), rand(0, 59));
                }

                Appointment::create([
                    'tenant_id' => $clinic->id,
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'appointment_date' => $appointmentDate->format('Y-m-d'),
                    'appointment_time' => $appointmentTime,
                    'status' => $status,
                    'patient_notes' => $this->getRandomPatientNote(),
                    'doctor_notes' => $status === 'completed' || $status === 'cancelled' ? $this->getRandomDoctorNote($status) : null,
                    'completed_at' => $completedAt,
                    'cancelled_at' => $cancelledAt,
                ]);
            }
        }

        $this->command->info('Appointments seeded for all clinics.');
    }

    private function getRandomPatientNote(): ?string
    {
        $notes = [
            'Regular check-up appointment',
            'Follow-up for previous consultation',
            'Experiencing headaches for past week',
            'Annual physical examination',
            'Skin rash on arm - needs evaluation',
            'Blood pressure monitoring',
            'Medication refill request',
            'Vaccination appointment',
            'Persistent cough and fever',
            'Routine blood work',
            'Back pain consultation',
            'Eye examination',
            'Allergy testing',
            'Digestive issues',
            'Sleep disorder consultation',
            null,
            null,
        ];
        return $notes[array_rand($notes)];
    }

    private function getRandomDoctorNote(string $status): ?string
    {
        if ($status === 'completed') {
            $notes = [
                'Patient vitals normal. Prescribed medication.',
                'All tests came back normal. Follow-up in 6 months.',
                'Recommended lifestyle changes and follow-up in 3 months.',
                'Prescribed antibiotics for infection. Complete course.',
                'Referral to specialist recommended.',
                'Patient responding well to treatment.',
                'No concerns found during examination.',
                'Adjusted medication dosage. Monitor for 2 weeks.',
            ];
        } elseif ($status === 'cancelled') {
            $notes = [
                'Patient cancelled due to scheduling conflict.',
                'Patient no-show. Rescheduled for next week.',
                'Patient requested cancellation due to feeling better.',
                'Emergency cancellation by patient.',
                'Insurance issue - patient will reschedule.',
            ];
        } else {
            $notes = [
                'Pending approval from clinic admin.',
                'Awaiting insurance verification.',
                'Patient needs to confirm appointment time.',
            ];
        }
        return $notes[array_rand($notes)];
    }
}