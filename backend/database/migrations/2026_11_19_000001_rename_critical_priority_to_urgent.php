<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE tasks SET priority = 'urgent' WHERE priority = 'critical'");
        DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check");
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");
    }

    public function down(): void
    {
        DB::statement("UPDATE tasks SET priority = 'critical' WHERE priority = 'urgent'");
        DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check");
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'))");
    }
};
