<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DocumentUpload;
use App\Models\LabResult;
use App\Models\MedicalHistory;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PatientRecordController extends Controller
{
    /**
     * Display the comprehensive medical records, reports, and prescriptions page for the authenticated patient.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Fetch all doctors this patient has had appointments with
        $consultedDoctorIds = Appointment::where('patient_id', $user->id)
            ->pluck('doctor_id')
            ->unique()
            ->filter();

        $doctors = User::whereIn('id', $consultedDoctorIds)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        // 2. Fetch Prescriptions with filters
        $prescriptionsQuery = Prescription::whereHas('appointment', function ($q) use ($user) {
            $q->where('patient_id', $user->id);
        })->with(['appointment.doctor', 'appointment.clinic']);

        if ($request->filled('doctor_id')) {
            $prescriptionsQuery->whereHas('appointment', function ($q) use ($request) {
                $q->where('doctor_id', $request->doctor_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $prescriptionsQuery->where(function ($q) use ($search) {
                $q->where('medicine_name', 'like', "%{$search}%")
                    ->orWhere('special_instructions', 'like', "%{$search}%")
                    ->orWhereHas('appointment.doctor', function ($dq) use ($search) {
                        $dq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('from_date')) {
            $prescriptionsQuery->whereHas('appointment', function ($q) use ($request) {
                $q->where('appointment_date', '>=', $request->from_date);
            });
        }

        if ($request->filled('to_date')) {
            $prescriptionsQuery->whereHas('appointment', function ($q) use ($request) {
                $q->where('appointment_date', '<=', $request->to_date);
            });
        }

        $prescriptions = $prescriptionsQuery->latest('created_at')->get();

        // 3. Fetch Lab Results with filters
        $labResultsQuery = LabResult::where('patient_id', $user->id)
            ->with(['appointment.doctor', 'clinic']);

        if ($request->filled('doctor_id')) {
            $labResultsQuery->whereHas('appointment', function ($q) use ($request) {
                $q->where('doctor_id', $request->doctor_id);
            });
        }

        if ($request->filled('status')) {
            $labResultsQuery->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $labResultsQuery->where(function ($q) use ($search) {
                $q->where('test_name', 'like', "%{$search}%")
                    ->orWhere('result_value', 'like', "%{$search}%");
            });
        }

        $labResults = $labResultsQuery->latest('recorded_at')->latest('created_at')->get();

        // 4. Fetch Document Uploads / External Reports
        $documentsQuery = DocumentUpload::where('patient_id', $user->id)
            ->with(['appointment.doctor', 'clinic', 'uploader']);

        if ($request->filled('category')) {
            $documentsQuery->where('category', $request->category);
        }

        if ($request->filled('doctor_id')) {
            $documentsQuery->whereHas('appointment', function ($q) use ($request) {
                $q->where('doctor_id', $request->doctor_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $documentsQuery->where('original_name', 'like', "%{$search}%");
        }

        $documents = $documentsQuery->latest('created_at')->get();

        // 5. Fetch Medical Histories / Conditions
        $medicalHistories = MedicalHistory::where('patient_id', $user->id)
            ->latest('diagnosis_date')
            ->get();

        // 6. Fetch Consultation Appointments History (completed/past)
        $consultations = Appointment::where('patient_id', $user->id)
            ->with(['doctor', 'clinic', 'prescriptions'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        $defaultTab = 'prescriptions';
        if ($request->routeIs('patient.reports.index')) {
            $defaultTab = 'reports';
        } elseif ($request->routeIs('patient.prescriptions.index')) {
            $defaultTab = 'prescriptions';
        }

        return Inertia::render('Patient/MedicalRecords', [
            'prescriptions' => $prescriptions,
            'labResults' => $labResults,
            'documents' => $documents,
            'medicalHistories' => $medicalHistories,
            'consultations' => $consultations,
            'doctors' => $doctors,
            'filters' => [
                'doctor_id' => $request->doctor_id ?? '',
                'category' => $request->category ?? '',
                'status' => $request->status ?? '',
                'search' => $request->search ?? '',
                'from_date' => $request->from_date ?? '',
                'to_date' => $request->to_date ?? '',
                'active_tab' => $request->active_tab ?? ($request->tab ?? $defaultTab),
            ],
        ]);
    }

    /**
     * Upload an external report, document, or scan by patient.
     */
    public function uploadReport(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:lab_report,prescription,medical_record,referral,immunization',
            'doctor_id' => 'nullable|exists:users,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,webp,doc,docx',
            'test_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('file');
        $fileName = Str::slug($request->title) . '-' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs('patient_reports/' . $user->id, $fileName, 'uploads');

        // Associate with an appointment if matching doctor provided
        $appointmentId = null;
        if ($request->filled('doctor_id')) {
            $appointment = Appointment::where('patient_id', $user->id)
                ->where('doctor_id', $request->doctor_id)
                ->latest('appointment_date')
                ->first();
            $appointmentId = $appointment?->id;
        }

        DocumentUpload::create([
            'patient_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'appointment_id' => $appointmentId,
            'original_name' => $request->title,
            'file_path' => $filePath,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'category' => $request->category,
            'uploaded_by' => $user->id,
        ]);

        // If it's a lab report, also create a record in LabResult for unified tracking
        if ($request->category === 'lab_report') {
            LabResult::create([
                'appointment_id' => $appointmentId,
                'patient_id' => $user->id,
                'tenant_id' => $user->tenant_id,
                'test_name' => $request->title,
                'result_value' => 'Uploaded by patient',
                'reference_range' => 'See attached document',
                'units' => 'N/A',
                'status' => 'completed',
                'file_path' => $filePath,
                'recorded_at' => $request->test_date ? \Carbon\Carbon::parse($request->test_date) : now(),
            ]);
        }

        return back()->with('success', 'Medical report uploaded successfully.');
    }

    /**
     * Download or view an uploaded document.
     */
    public function downloadDocument(DocumentUpload $document): StreamedResponse
    {
        $user = request()->user();

        // Patient can only download their own documents
        if ($user->role === 'patient' && $document->patient_id !== $user->id) {
            abort(403, 'Unauthorized access to this document.');
        }

        // Doctor/Admin can only download documents for their tenant
        if (in_array($user->role, ['doctor', 'clinic_admin']) && $document->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this document.');
        }

        if (! Storage::disk('uploads')->exists($document->file_path)) {
            abort(404, 'File not found on storage.');
        }

        return Storage::disk('uploads')->download($document->file_path, $document->original_name);
    }
}
