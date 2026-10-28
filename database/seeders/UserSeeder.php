<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
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

        // 1. Super Admin (no tenant)
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@clinicpro.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'tenant_id' => null,
            'phone' => '+1 (555) 200-0001',
            'age' => 40,
            'gender' => 'Male',
            'is_active' => true,
        ]);

        // 2. Clinic Admins (one per clinic)
        $clinicAdmins = [
            ['name' => 'Alice Johnson', 'email' => 'alice.johnson@citymedical.com', 'phone' => '+1 (555) 300-0001', 'clinic' => 'City Medical Center'],
            ['name' => 'Bob Smith', 'email' => 'bob.smith@metrohealth.com', 'phone' => '+1 (555) 300-0002', 'clinic' => 'Metro Health Clinic'],
            ['name' => 'Carol Davis', 'email' => 'carol.davis@familycare.com', 'phone' => '+1 (555) 300-0003', 'clinic' => 'Family Care Center'],
            ['name' => 'David Wilson', 'email' => 'david.wilson@sunrisewellness.com', 'phone' => '+1 (555) 300-0004', 'clinic' => 'Sunrise Wellness Clinic'],
            ['name' => 'Eva Martinez', 'email' => 'eva.martinez@greenfieldpeds.com', 'phone' => '+1 (555) 300-0005', 'clinic' => 'Greenfield Pediatrics'],
        ];

        foreach ($clinicAdmins as $admin) {
            $clinic = $clinics->where('name', $admin['clinic'])->first();
            if ($clinic) {
                User::create([
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'clinic_admin',
                    'tenant_id' => $clinic->id,
                    'phone' => $admin['phone'],
                    'age' => rand(35, 55),
                    'gender' => ['Male', 'Female'][array_rand(['Male', 'Female'])],
                    'is_active' => true,
                ]);
            }
        }

        // 3. Doctors (2-3 per clinic)
        $doctors = [
            // City Medical Center doctors
            ['name' => 'Dr. Sarah Johnson', 'email' => 'sarah.johnson@citymedical.com', 'specialty' => 'Cardiology', 'phone' => '+1 (555) 400-0001', 'age' => 42, 'gender' => 'Female', 'clinic' => 'City Medical Center'],
            ['name' => 'Dr. Michael Chen', 'email' => 'michael.chen@citymedical.com', 'specialty' => 'Dermatology', 'phone' => '+1 (555) 400-0002', 'age' => 38, 'gender' => 'Male', 'clinic' => 'City Medical Center'],
            ['name' => 'Dr. Emily Davis', 'email' => 'emily.davis@citymedical.com', 'specialty' => 'General Practice', 'phone' => '+1 (555) 400-0003', 'age' => 45, 'gender' => 'Female', 'clinic' => 'City Medical Center'],

            // Metro Health Clinic doctors
            ['name' => 'Dr. Robert Wilson', 'email' => 'robert.wilson@metrohealth.com', 'specialty' => 'Orthopedics', 'phone' => '+1 (555) 400-0004', 'age' => 50, 'gender' => 'Male', 'clinic' => 'Metro Health Clinic'],
            ['name' => 'Dr. Lisa Anderson', 'email' => 'lisa.anderson@metrohealth.com', 'specialty' => 'Pediatrics', 'phone' => '+1 (555) 400-0005', 'age' => 36, 'gender' => 'Female', 'clinic' => 'Metro Health Clinic'],

            // Family Care Center doctors
            ['name' => 'Dr. James Taylor', 'email' => 'james.taylor@familycare.com', 'specialty' => 'Internal Medicine', 'phone' => '+1 (555) 400-0006', 'age' => 48, 'gender' => 'Male', 'clinic' => 'Family Care Center'],
            ['name' => 'Dr. Maria Garcia', 'email' => 'maria.garcia@familycare.com', 'specialty' => 'Gynecology', 'phone' => '+1 (555) 400-0007', 'age' => 41, 'gender' => 'Female', 'clinic' => 'Family Care Center'],

            // Sunrise Wellness Clinic doctors
            ['name' => 'Dr. David Brown', 'email' => 'david.brown@sunrisewellness.com', 'specialty' => 'Neurology', 'phone' => '+1 (555) 400-0008', 'age' => 52, 'gender' => 'Male', 'clinic' => 'Sunrise Wellness Clinic'],
            ['name' => 'Dr. Jennifer Lee', 'email' => 'jennifer.lee@sunrisewellness.com', 'specialty' => 'Psychiatry', 'phone' => '+1 (555) 400-0009', 'age' => 39, 'gender' => 'Female', 'clinic' => 'Sunrise Wellness Clinic'],

            // Greenfield Pediatrics doctors
            ['name' => 'Dr. Christopher Clark', 'email' => 'christopher.clark@greenfieldpeds.com', 'specialty' => 'Pediatrics', 'phone' => '+1 (555) 400-0010', 'age' => 44, 'gender' => 'Male', 'clinic' => 'Greenfield Pediatrics'],
        ];

        foreach ($doctors as $doctor) {
            $clinic = $clinics->where('name', $doctor['clinic'])->first();
            if ($clinic) {
                User::create([
                    'name' => $doctor['name'],
                    'email' => $doctor['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'doctor',
                    'tenant_id' => $clinic->id,
                    'phone' => $doctor['phone'],
                    'specialty' => $doctor['specialty'],
                    'age' => $doctor['age'],
                    'gender' => $doctor['gender'],
                    'is_active' => true,
                ]);
            }
        }

        // 4. Patients (5-8 per clinic)
        $patientNames = [
            'John Smith', 'Maria Garcia', 'Robert Wilson', 'Lisa Anderson', 'David Brown',
            'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Taylor', 'Jennifer Lee',
            'Christopher Clark', 'Amanda White', 'Daniel Harris', 'Matthew Lewis', 'Ashley Walker',
            'Joshua Hall', 'Elizabeth Martin', 'Andrew Thompson', 'Nicole Robinson', 'Kevin Martinez',
            'Stephanie Clark', 'Ryan Rodriguez', 'Michelle Lewis', 'Brandon Walker', 'Laura Hall',
            'Justin Allen', 'Heather Young', 'Tyler King', 'Rachel Wright', 'Sean Lopez',
        ];

        $patientIndex = 0;
        foreach ($clinics as $clinic) {
            $patientCount = rand(5, 8);
            for ($i = 0; $i < $patientCount; $i++) {
                if ($patientIndex >= count($patientNames)) break;
                $name = $patientNames[$patientIndex++];
                $emailName = strtolower(str_replace(' ', '.', $name));
                $clinicShort = strtolower(str_replace(' ', '', $clinic->name));
                
                User::create([
                    'name' => $name,
                    'email' => "{$emailName}@{$clinicShort}.com",
                    'password' => Hash::make('password123'),
                    'role' => 'patient',
                    'tenant_id' => $clinic->id,
                    'phone' => '+1 (555) ' . rand(100, 999) . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT),
                    'age' => rand(18, 80),
                    'gender' => ['Male', 'Female'][array_rand(['Male', 'Female'])],
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('Users seeded: 1 Super Admin, 5 Clinic Admins, 10 Doctors, ~30 Patients');
    }
}