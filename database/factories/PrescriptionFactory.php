<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Prescription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $medicines = [
            ['name' => 'Amoxicillin', 'dosage' => '500mg', 'frequency' => 'Three times daily', 'duration' => '7 days', 'instructions' => 'Take with food. Complete the full course.'],
            ['name' => 'Ibuprofen', 'dosage' => '400mg', 'frequency' => 'Every 6 hours as needed', 'duration' => '5 days', 'instructions' => 'Take with meals.'],
            ['name' => 'Lisinopril', 'dosage' => '10mg', 'frequency' => 'Once daily', 'duration' => '30 days', 'instructions' => 'Take in the morning. Monitor blood pressure.'],
            ['name' => 'Metformin', 'dosage' => '500mg', 'frequency' => 'Twice daily with meals', 'duration' => '90 days', 'instructions' => 'Take with breakfast and dinner.'],
            ['name' => 'Atorvastatin', 'dosage' => '20mg', 'frequency' => 'Once daily at bedtime', 'duration' => '90 days', 'instructions' => 'Take at night. Avoid grapefruit juice.'],
            ['name' => 'Omeprazole', 'dosage' => '20mg', 'frequency' => 'Once daily before breakfast', 'duration' => '14 days', 'instructions' => 'Take 30 minutes before eating.'],
            ['name' => 'Azithromycin', 'dosage' => '500mg', 'frequency' => 'Once daily', 'duration' => '3 days', 'instructions' => 'Take on empty stomach.'],
            ['name' => 'Cetirizine', 'dosage' => '10mg', 'frequency' => 'Once daily', 'duration' => '30 days', 'instructions' => 'May cause drowsiness.'],
        ];

        $med = fake()->randomElement($medicines);

        return [
            'tenant_id' => Clinic::factory(),
            'appointment_id' => Appointment::factory(),
            'medicine_name' => $med['name'],
            'dosage' => $med['dosage'],
            'frequency' => $med['frequency'],
            'duration' => $med['duration'],
            'special_instructions' => $med['instructions'],
        ];
    }
}

