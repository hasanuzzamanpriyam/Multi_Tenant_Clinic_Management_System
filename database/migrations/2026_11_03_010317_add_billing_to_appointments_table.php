<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('billing_status')->default('unbilled')->after('priority'); // unbilled, invoiced, partially_paid, paid
            $table->foreignId('invoice_id')->nullable()->after('billing_status')->constrained()->onDelete('set null');
            $table->index(['billing_status']);
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['billing_status']);
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['billing_status', 'invoice_id']);
        });
    }
};