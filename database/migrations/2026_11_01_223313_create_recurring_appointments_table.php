<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->integer('day_of_week'); // 0=Sunday to 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->string('recurrence_type')->default('weekly'); // weekly, monthly
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['doctor_id', 'tenant_id']);
            $table->index(['day_of_week', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_appointments');
    }
};
