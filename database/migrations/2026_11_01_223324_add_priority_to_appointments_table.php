<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('priority')->default('normal')->after('status'); // normal, urgent, emergency
            $table->string('meeting_url')->nullable()->after('priority');
            $table->string('meeting_token')->nullable()->after('meeting_url');
            $table->index(['priority']);
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['priority']);
            $table->dropColumn(['priority', 'meeting_url', 'meeting_token']);
        });
    }
};
