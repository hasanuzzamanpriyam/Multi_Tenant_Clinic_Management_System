<?php

namespace Database\Seeders;

use App\Models\DoctorAvailability;
use App\Models\User;
use Illuminate\Database\Seeder;

class DoctorAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctors = User::where('role', 'doctor')->get();

        if ($doctors->isEmpty()) {
            $this->command->warn('No doctors found. Run UserSeeder first.');
            return;
        }

        // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        $weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        foreach ($doctors as $doctor) {
            // Each doctor gets 3-5 availability slots per week
            $slotsPerWeek = rand(3, 5);
            $usedSlots = [];

            for ($i = 0; $i < $slotsPerWeek; $i++) {
                // Pick a random day (Mon-Fri mostly, occasional Sat)
                $dayOfWeek = rand(1, 5); // Monday to Friday
                
                // Pick random start time between 8 AM and 1 PM
                $startHour = rand(8, 13);
                $startMinute = [0, 30][array_rand([0, 30])];
                
                // Duration 1-3 hours
                $durationHours = rand(1, 3);
                $endHour = min($startHour + $durationHours, 17); // Max 5 PM
                $endMinute = $startMinute;

                $startTime = sprintf('%02d:%02d:00', $startHour, $startMinute);
                $endTime = sprintf('%02d:%02d:00', $endHour, $endMinute);

                // Create unique key for this slot
                $slotKey = "{$dayOfWeek}-{$startTime}-{$endTime}";
                
                // Avoid duplicate slots for same doctor on same day/time
                if (in_array($slotKey, $usedSlots)) {
                    continue;
                }
                $usedSlots[] = $slotKey;

                // Mostly available, some unavailable
                $isAvailable = rand(1, 10) > 1; // 90% available

                DoctorAvailability::create([
                    'tenant_id' => $doctor->tenant_id,
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $dayOfWeek,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'is_available' => $isAvailable,
                ]);
            }

            // Add one Saturday slot for some doctors (30% chance)
            if (rand(1, 10) <= 3) {
                $startHour = 9;
                $startMinute = 0;
                $endHour = 13;
                $endMinute = 0;

                DoctorAvailability::create([
                    'tenant_id' => $doctor->tenant_id,
                    'doctor_id' => $doctor->id,
                    'day_of_week' => 6, // Saturday
                    'start_time' => sprintf('%02d:%02d:00', $startHour, $startMinute),
                    'end_time' => sprintf('%02d:%02d:00', $endHour, $endMinute),
                    'is_available' => true,
                ]);
            }
        }

        $this->command->info('Doctor availabilities seeded for all doctors.');
    }
}