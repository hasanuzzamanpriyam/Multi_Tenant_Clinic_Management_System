<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->foreignId('from_doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('to_doctor_id')->constrained('users')->onDelete('cascade');
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, accepted, completed, rejected
            $table->date('referral_date');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            $table->index(['patient_id', 'tenant_id']);
            $table->index(['from_doctor_id', 'to_doctor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_referrals');
    }
};
