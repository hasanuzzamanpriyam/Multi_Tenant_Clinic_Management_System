<?php

namespace App\Http\Controllers;

use App\Models\DocumentUpload;
use App\Models\User as UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentUploadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = DocumentUpload::with(['patient', 'uploader']);

        if ($user->role === 'super_admin') {
            // all
        } elseif ($user->role === 'clinic_admin') {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($user->role === 'doctor') {
            $query->whereIn('appointment_id', function ($q) use ($user) {
                $q->select('id')->from('appointments')->where('doctor_id', $user->id);
            })->orWhere('uploaded_by', $user->id);
        } else {
            $query->where('patient_id', $user->id);
        }

        $documents = $query->paginate(15);

        return inertia('Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'appointment_id' => 'sometimes|exists:appointments,id',
            'file' => 'required|file|max:10240', // 10MB
            'category' => 'required|in:prescription,lab_report,medical_record,referral,immunization',
        ]);

        $patient = UserModel::findOrFail($request->patient_id);

        if ($request->user()->role !== 'super_admin' && $patient->tenant_id !== $request->user()->tenant_id) {
            return back()->withErrors(['patient_id' => 'Invalid patient.']);
        }

        $file = $request->file('file');
        $path = $file->storeAs(
            'clinical/'.$patient->tenant_id,
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            'uploads'
        );

        DocumentUpload::create([
            'patient_id' => $request->patient_id,
            'tenant_id' => $patient->tenant_id,
            'appointment_id' => $request->appointment_id,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'category' => $request->category,
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function download(Request $request, DocumentUpload $document)
    {
        $user = $request->user();

        if ($user->role !== 'super_admin'
            && ($user->role === 'clinic_admin' ? $document->tenant_id !== $user->tenant_id : true)
            && $document->patient_id !== $user->id
            && $document->uploaded_by !== $user->id
        ) {
            abort(403, 'Unauthorized access.');
        }

        $url = Storage::temporaryUrl(
            $document->file_path,
            now()->addMinutes(60),
            ['disks' => 'uploads']
        );

        return redirect($url);
    }
}
