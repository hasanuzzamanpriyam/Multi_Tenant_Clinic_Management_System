<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\DocumentUpload;
use App\Models\LabResult;
use App\Models\MedicalHistory;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PatientClinicalDataSeeder extends Seeder
{
    public function run(): void
    {
        $patient = User::where('role', 'patient')->first();
        if (! $patient) {
            $this->command->warn('No patient found.');
            return;
        }

        $doctors = User::where('tenant_id', $patient->tenant_id)
            ->where('role', 'doctor')
            ->get();

        if ($doctors->isEmpty()) {
            $this->command->warn('No doctors found.');
            return;
        }

        $docSarah = $doctors->firstWhere('name', 'Dr. Sarah Johnson') ?? $doctors->first();
        $docMichael = $doctors->firstWhere('name', 'Dr. Michael Chen') ?? $doctors->skip(1)->first() ?? $docSarah;
        $docEmily = $doctors->firstWhere('name', 'Dr. Emily Davis') ?? $doctors->last() ?? $docSarah;

        // Ensure patient has appointments with multiple doctors
        $app1 = Appointment::firstOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $docSarah->id, 'status' => 'completed'],
            [
                'tenant_id' => $patient->tenant_id,
                'appointment_date' => Carbon::now()->subDays(14)->toDateString(),
                'appointment_time' => '10:00:00',
                'patient_notes' => 'Hypertension & Cardiac Follow-up',
                'doctor_notes' => 'Blood pressure is stable. Continue Lisinopril 10mg daily and monitor weekly.',
                'created_at' => Carbon::now()->subDays(14),
            ]
        );

        $app2 = Appointment::firstOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $docMichael->id, 'status' => 'completed'],
            [
                'tenant_id' => $patient->tenant_id,
                'appointment_date' => Carbon::now()->subDays(45)->toDateString(),
                'appointment_time' => '14:30:00',
                'patient_notes' => 'Dermatology check for skin rash',
                'doctor_notes' => 'Contact dermatitis on forearm. Prescribed topical ointment and antihistamine.',
                'created_at' => Carbon::now()->subDays(45),
            ]
        );

        $app3 = Appointment::firstOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $docEmily->id, 'status' => 'completed'],
            [
                'tenant_id' => $patient->tenant_id,
                'appointment_date' => Carbon::now()->subDays(90)->toDateString(),
                'appointment_time' => '09:15:00',
                'patient_notes' => 'Comprehensive Annual Health Checkup',
                'doctor_notes' => 'Routine physical exam within normal limits. Ordered lipid panel and fasting blood sugar.',
                'created_at' => Carbon::now()->subDays(90),
            ]
        );

        // Seed Prescriptions across different doctors
        $prescriptionsData = [
            [
                'appointment_id' => $app1->id,
                'medicine_name' => 'Lisinopril',
                'dosage' => '10mg',
                'frequency' => 'Once daily in the morning',
                'duration' => '90 days',
                'special_instructions' => 'Take with a glass of water. Monitor home blood pressure regularly.',
            ],
            [
                'appointment_id' => $app1->id,
                'medicine_name' => 'Atorvastatin',
                'dosage' => '20mg',
                'frequency' => 'Once daily at bedtime',
                'duration' => '90 days',
                'special_instructions' => 'Take at night after food. Avoid consuming grapefruit or grapefruit juice.',
            ],
            [
                'appointment_id' => $app2->id,
                'medicine_name' => 'Cetirizine Hydrochloride',
                'dosage' => '10mg',
                'frequency' => 'Once daily as needed for allergies',
                'duration' => '30 days',
                'special_instructions' => 'May cause slight drowsiness. Take in the evening if feeling tired.',
            ],
            [
                'appointment_id' => $app2->id,
                'medicine_name' => 'Hydrocortisone 1% Cream',
                'dosage' => 'Apply thin layer',
                'frequency' => 'Twice daily',
                'duration' => '7 days',
                'special_instructions' => 'Apply to affected area only after washing and drying skin thoroughly.',
            ],
            [
                'appointment_id' => $app3->id,
                'medicine_name' => 'Vitamin D3 (Cholecalciferol)',
                'dosage' => '2000 IU',
                'frequency' => 'Once daily with meal',
                'duration' => '60 days',
                'special_instructions' => 'Take with your largest meal of the day containing healthy fats.',
            ],
            [
                'appointment_id' => $app3->id,
                'medicine_name' => 'Omega-3 Fish Oil',
                'dosage' => '1000mg',
                'frequency' => 'Twice daily',
                'duration' => '60 days',
                'special_instructions' => 'Cardiovascular support. Take with meals.',
            ],
        ];

        foreach ($prescriptionsData as $pData) {
            Prescription::firstOrCreate(
                [
                    'appointment_id' => $pData['appointment_id'],
                    'medicine_name' => $pData['medicine_name'],
                ],
                [
                    'tenant_id' => $patient->tenant_id,
                    'dosage' => $pData['dosage'],
                    'frequency' => $pData['frequency'],
                    'duration' => $pData['duration'],
                    'special_instructions' => $pData['special_instructions'],
                ]
            );
        }

        // Seed Lab Results
        $labData = [
            [
                'appointment_id' => $app1->id,
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'test_name' => 'Lipid Profile Panel',
                'result_value' => 'Cholesterol: 185 mg/dL | LDL: 110 mg/dL | HDL: 52 mg/dL | Triglycerides: 140 mg/dL',
                'reference_range' => 'Total < 200 mg/dL, LDL < 100 mg/dL, HDL > 40 mg/dL',
                'units' => 'mg/dL',
                'status' => 'completed',
                'recorded_at' => Carbon::now()->subDays(12),
            ],
            [
                'appointment_id' => $app1->id,
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'test_name' => 'Comprehensive Metabolic Panel (CMP)',
                'result_value' => 'Fasting Glucose: 92 | BUN: 14 | Creatinine: 0.9 | eGFR: >90 | Potassium: 4.2',
                'reference_range' => 'Glucose: 70-99 mg/dL, Potassium: 3.5-5.0 mEq/L',
                'units' => 'Mixed',
                'status' => 'completed',
                'recorded_at' => Carbon::now()->subDays(12),
            ],
            [
                'appointment_id' => $app3->id,
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'test_name' => 'Complete Blood Count (CBC) with Differential',
                'result_value' => 'WBC: 6.8 | RBC: 4.75 | Hemoglobin: 14.6 | Hematocrit: 43.2% | Platelets: 245',
                'reference_range' => 'WBC: 4.5-11.0 K/uL, Hemoglobin: 13.5-17.5 g/dL',
                'units' => 'Standard',
                'status' => 'completed',
                'recorded_at' => Carbon::now()->subDays(88),
            ],
            [
                'appointment_id' => $app3->id,
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'test_name' => 'Thyroid Stimulating Hormone (TSH)',
                'result_value' => '2.14',
                'reference_range' => '0.40 - 4.50 mIU/L',
                'units' => 'mIU/L',
                'status' => 'completed',
                'recorded_at' => Carbon::now()->subDays(88),
            ],
            [
                'appointment_id' => $app3->id,
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'test_name' => 'Glycated Hemoglobin (HbA1c)',
                'result_value' => '5.4%',
                'reference_range' => '< 5.7% (Normal Non-Diabetic)',
                'units' => '%',
                'status' => 'completed',
                'recorded_at' => Carbon::now()->subDays(88),
            ],
        ];

        foreach ($labData as $lab) {
            LabResult::firstOrCreate(
                [
                    'patient_id' => $lab['patient_id'],
                    'test_name' => $lab['test_name'],
                ],
                $lab
            );
        }

        // Seed Document Uploads
        $docUploads = [
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'appointment_id' => $app1->id,
                'original_name' => '12-Lead Electrocardiogram (ECG) Report.pdf',
                'file_path' => 'clinical/demo/ecg-report.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024 * 450, // 450 KB
                'category' => 'lab_report',
                'uploaded_by' => $docSarah->id,
                'created_at' => Carbon::now()->subDays(14),
            ],
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'appointment_id' => $app3->id,
                'original_name' => 'Chest X-Ray PA View Digital Radiology.pdf',
                'file_path' => 'clinical/demo/chest-xray.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024 * 1250, // 1.25 MB
                'category' => 'lab_report',
                'uploaded_by' => $docEmily->id,
                'created_at' => Carbon::now()->subDays(88),
            ],
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'appointment_id' => $app2->id,
                'original_name' => 'Dermatology Pathology Biopsy Findings.pdf',
                'file_path' => 'clinical/demo/pathology-findings.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024 * 320, // 320 KB
                'category' => 'medical_record',
                'uploaded_by' => $docMichael->id,
                'created_at' => Carbon::now()->subDays(45),
            ],
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'appointment_id' => null,
                'original_name' => 'Official Immunization & Vaccination History Card.pdf',
                'file_path' => 'clinical/demo/immunization-history.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024 * 210, // 210 KB
                'category' => 'immunization',
                'uploaded_by' => $patient->id,
                'created_at' => Carbon::now()->subDays(100),
            ],
        ];

        foreach ($docUploads as $doc) {
            DocumentUpload::firstOrCreate(
                [
                    'patient_id' => $doc['patient_id'],
                    'original_name' => $doc['original_name'],
                ],
                $doc
            );
        }

        // Seed Medical History
        $histories = [
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'condition' => 'Primary Hypertension',
                'diagnosis_date' => Carbon::now()->subMonths(18)->toDateString(),
                'notes' => 'Diagnosed during routine wellness exam. Well-managed with ACE inhibitors.',
                'is_chronic' => true,
            ],
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'condition' => 'Seasonal Allergic Rhinitis',
                'diagnosis_date' => Carbon::now()->subMonths(36)->toDateString(),
                'notes' => 'Pollen allergy exacerbations in early spring.',
                'is_chronic' => false,
            ],
            [
                'patient_id' => $patient->id,
                'tenant_id' => $patient->tenant_id,
                'condition' => 'Mild Dyslipidemia',
                'diagnosis_date' => Carbon::now()->subMonths(8)->toDateString(),
                'notes' => 'Borderline elevated LDL. Responding well to moderate statin therapy & diet.',
                'is_chronic' => true,
            ],
        ];

        foreach ($histories as $hist) {
            MedicalHistory::firstOrCreate(
                [
                    'patient_id' => $hist['patient_id'],
                    'condition' => $hist['condition'],
                ],
                $hist
            );
        }

        $this->command->info('Patient clinical records, lab results, prescriptions, and documents seeded successfully.');
    }
}
