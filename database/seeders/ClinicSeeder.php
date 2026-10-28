<?php

namespace Database\Seeders;

use App\Models\Clinic;
use Illuminate\Database\Seeder;

class ClinicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clinics = [
            [
                'name' => 'City Medical Center',
                'email' => 'info@citymedical.com',
                'phone' => '+1 (555) 100-0001',
                'address' => '123 Main Street, Downtown, NY 10001',
            ],
            [
                'name' => 'Metro Health Clinic',
                'email' => 'contact@metrohealth.com',
                'phone' => '+1 (555) 100-0002',
                'address' => '456 Oak Avenue, Midtown, NY 10002',
            ],
            [
                'name' => 'Family Care Center',
                'email' => 'hello@familycare.com',
                'phone' => '+1 (555) 100-0003',
                'address' => '789 Pine Road, Uptown, NY 10003',
            ],
            [
                'name' => 'Sunrise Wellness Clinic',
                'email' => 'info@sunrisewellness.com',
                'phone' => '+1 (555) 100-0004',
                'address' => '321 Elm Street, Brooklyn, NY 11201',
            ],
            [
                'name' => 'Greenfield Pediatrics',
                'email' => 'appointments@greenfieldpeds.com',
                'phone' => '+1 (555) 100-0005',
                'address' => '654 Maple Drive, Queens, NY 11301',
            ],
        ];

        foreach ($clinics as $clinic) {
            Clinic::create($clinic);
        }
    }
}