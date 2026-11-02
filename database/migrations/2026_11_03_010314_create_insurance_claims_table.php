<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->string('insurance_provider');
            $table->string('policy_number');
            $table->string('claim_number')->unique();
            $table->string('diagnosis_code')->nullable(); // ICD-10
            $table->string('procedure_code')->nullable(); // CPT
            $table->decimal('amount_claimed', 10, 2)->default(0);
            $table->decimal('amount_approved', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('status')->default('draft'); // draft, submitted, under_review, approved, denied, paid
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->text('denial_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'patient_id']);
            $table->index(['tenant_id', 'status']);
            $table->index('claim_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
    }
};