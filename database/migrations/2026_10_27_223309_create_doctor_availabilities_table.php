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
        Schema::create('doctor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')
                ->constrained('clinics')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('doctor_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0 = Sunday, 6 = Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // Unique constraint: a doctor cannot have overlapping availability for the same day/time
            $table->unique(['doctor_id', 'day_of_week', 'start_time', 'end_time'], 'doctor_availabilities_unique_schedule');

            // Indexes for common queries
            $table->index(['tenant_id', 'doctor_id']);
            $table->index(['doctor_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_availabilities');
    }
};