<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')
                ->constrained('clinics')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('patient_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('doctor_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])
                ->default('pending');
            $table->text('patient_notes')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            // Indexes for common queries
            $table->index(['tenant_id', 'appointment_date']);
            $table->index(['tenant_id', 'status']);
            $table->index(['patient_id', 'appointment_date']);
            $table->index(['doctor_id', 'appointment_date']);
            $table->index(['doctor_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};