<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Database\Seeder;

class PrescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $samplePrescriptions = [
            [
                'medicine_name' => 'Amoxicillin',
                'dosage' => '500mg',
                'frequency' => 'Three times daily',
                'duration' => '7 days',
                'special_instructions' => 'Take with food. Complete the full course.',
            ],
            [
                'medicine_name' => 'Ibuprofen',
                'dosage' => '400mg',
                'frequency' => 'Every 6 hours as needed',
                'duration' => '5 days',
                'special_instructions' => 'Take with food. Do not exceed 1200mg in 24 hours.',
            ],
            [
                'medicine_name' => 'Lisinopril',
                'dosage' => '10mg',
                'frequency' => 'Once daily',
                'duration' => '30 days',
                'special_instructions' => 'Take in the morning. Monitor blood pressure.',
            ],
            [
                'medicine_name' => 'Metformin',
                'dosage' => '500mg',
                'frequency' => 'Twice daily with meals',
                'duration' => '90 days',
                'special_instructions' => 'Take with breakfast and dinner. Monitor blood sugar.',
            ],
            [
                'medicine_name' => 'Atorvastatin',
                'dosage' => '20mg',
                'frequency' => 'Once daily at bedtime',
                'duration' => '90 days',
                'special_instructions' => 'Take at night. Avoid grapefruit juice.',
            ],
            [
                'medicine_name' => 'Omeprazole',
                'dosage' => '20mg',
                'frequency' => 'Once daily before breakfast',
                'duration' => '14 days',
                'special_instructions' => 'Take 30 minutes before eating. Swallow whole.',
            ],
            [
                'medicine_name' => 'Azithromycin',
                'dosage' => '500mg',
                'frequency' => 'Once daily',
                'duration' => '3 days',
                'special_instructions' => 'Take on empty stomach 1 hour before or 2 hours after meals.',
            ],
            [
                'medicine_name' => 'Prednisone',
                'dosage' => '20mg',
                'frequency' => 'Once daily in morning',
                'duration' => '5 days',
                'special_instructions' => 'Taper dose as directed. Take with food to prevent stomach upset.',
            ],
            [
                'medicine_name' => 'Cetirizine',
                'dosage' => '10mg',
                'frequency' => 'Once daily',
                'duration' => '30 days',
                'special_instructions' => 'May cause drowsiness. Take at bedtime if affected.',
            ],
            [
                'medicine_name' => 'Fluticasone Nasal Spray',
                'dosage' => '2 sprays per nostril',
                'frequency' => 'Once daily',
                'duration' => '30 days',
                'special_instructions' => 'Shake well before use. Prime before first use.',
            ],
        ];

        // Get all completed appointments
        $completedAppointments = Appointment::where('status', 'completed')->get();

        if ($completedAppointments->isEmpty()) {
            $this->command->info('No completed appointments found. Skipping prescription seeding.');
            return;
        }

        foreach ($completedAppointments as $appointment) {
            // Randomly assign 1-4 prescriptions to each completed appointment
            $numPrescriptions = rand(1, min(4, count($samplePrescriptions)));
            $selectedPrescriptions = collect($samplePrescriptions)->shuffle()->take($numPrescriptions);

            foreach ($selectedPrescriptions as $prescriptionData) {
                Prescription::create([
                    'tenant_id' => $appointment->tenant_id,
                    'appointment_id' => $appointment->id,
                    'medicine_name' => $prescriptionData['medicine_name'],
                    'dosage' => $prescriptionData['dosage'],
                    'frequency' => $prescriptionData['frequency'],
                    'duration' => $prescriptionData['duration'],
                    'special_instructions' => $prescriptionData['special_instructions'],
                ]);
            }
        }

        $this->command->info('Prescriptions seeded for ' . $completedAppointments->count() . ' completed appointments.');
    }
}