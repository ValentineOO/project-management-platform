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
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('causer_id')
                ->constrained('projects')->nullOnDelete();

            $table->index(['project_id', 'created_at'], 'activity_logs_project_id_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropIndex('activity_logs_project_id_created_at_index');
            $table->dropColumn('project_id');
        });
    }
};
