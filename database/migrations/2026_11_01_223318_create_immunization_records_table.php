<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('immunization_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->string('vaccine_name');
            $table->integer('dose_number')->default(1);
            $table->date('administered_at')->nullable();
            $table->date('next_due_at')->nullable();
            $table->foreignId('administered_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['patient_id', 'tenant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('immunization_records');
    }
};
