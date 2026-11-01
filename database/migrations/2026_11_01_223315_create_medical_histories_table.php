<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->string('condition');
            $table->date('diagnosis_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_chronic')->default(false);
            $table->timestamps();

            $table->index(['patient_id', 'tenant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_histories');
    }
};
