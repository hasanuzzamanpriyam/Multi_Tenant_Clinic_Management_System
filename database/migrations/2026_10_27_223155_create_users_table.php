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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->foreignId('tenant_id')
                ->nullable()
                ->constrained('clinics')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->enum('role', ['super_admin', 'clinic_admin', 'doctor', 'patient'])
                ->default('patient');
            $table->string('phone')->nullable();
            $table->string('specialty')->nullable();
            $table->integer('age')->nullable();
            $table->string('gender')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamps();

            // Indexes for common queries
            $table->index(['tenant_id', 'role']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};