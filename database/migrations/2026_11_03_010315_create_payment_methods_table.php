<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('clinics')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // stripe, paypal
            $table->string('gateway_customer_id')->nullable();
            $table->string('gateway_payment_method_id')->nullable();
            $table->string('brand')->nullable(); // visa, mastercard, amex
            $table->string('last4')->nullable();
            $table->integer('exp_month')->nullable();
            $table->integer('exp_year')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'patient_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};