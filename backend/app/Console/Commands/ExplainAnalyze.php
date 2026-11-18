<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExplainAnalyze extends Command
{
    protected $signature = 'db:explain {--save : Write output to storage/explain-analyze.txt}';
    protected $description = 'Run EXPLAIN ANALYZE on key queries to validate index usage';

    public function handle(): int
    {
        $projectId = DB::table('projects')->value('id');
        $searchTerm = 'authentication';
        $userId = DB::table('users')->value('id');

        if (!$projectId) {
            $this->error('No data found — run php artisan db:seed first.');
            return 1;
        }

        $queries = [
            'Cursor pagination on tasks (project_id + created_at)' => [
                'sql' => 'SELECT id, title, status, created_at FROM tasks
                          WHERE project_id = ? AND deleted_at IS NULL
                          ORDER BY created_at ASC LIMIT 20',
                'bindings' => [$projectId],
            ],
            'Status filter on tasks (composite project_id + status)' => [
                'sql' => 'SELECT id, title, status FROM tasks
                          WHERE project_id = ? AND status = ? AND deleted_at IS NULL
                          ORDER BY created_at ASC LIMIT 20',
                'bindings' => [$projectId, 'in_progress'],
            ],
            'Full-text search with pg_trgm ILIKE on tasks.title' => [
                'sql' => "SELECT id, title, project_id FROM tasks
                          WHERE title ILIKE ? AND deleted_at IS NULL LIMIT 10",
                'bindings' => ["%{$searchTerm}%"],
            ],
            'Full-text search with pg_trgm ILIKE on projects.name' => [
                'sql' => "SELECT id, name, status FROM projects
                          WHERE name ILIKE ? AND deleted_at IS NULL LIMIT 10",
                'bindings' => ["%Platform%"],
            ],
            'Dashboard: task aggregation by status for assignee' => [
                'sql' => 'SELECT status, count(*) as total FROM tasks
                          WHERE assignee_id = ? AND deleted_at IS NULL
                          GROUP BY status',
                'bindings' => [$userId],
            ],
            'Activity log: recent events for a project (project_id + created_at)' => [
                'sql' => 'SELECT action, created_at FROM activity_logs
                          WHERE project_id = ?
                          ORDER BY created_at DESC LIMIT 10',
                'bindings' => [$projectId],
            ],
        ];

        $output = [];
        $output[] = str_repeat('=', 80);
        $output[] = 'EXPLAIN ANALYZE — Project Management Platform';
        $output[] = 'Generated: ' . now()->toDateTimeString();
        $output[] = 'Dataset: ~50,000 tasks across 100 projects';
        $output[] = str_repeat('=', 80);

        foreach ($queries as $label => $query) {
            $this->line('');
            $this->info("▶ {$label}");

            $plan = DB::select(
                'EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ' . $query['sql'],
                $query['bindings']
            );

            $planText = implode("\n", array_map(fn ($r) => array_values((array) $r)[0], $plan));

            $this->line($planText);

            $output[] = '';
            $output[] = "── {$label}";
            $output[] = "   SQL: " . preg_replace('/\s+/', ' ', trim($query['sql']));
            $output[] = '';
            $output[] = $planText;
            $output[] = str_repeat('-', 80);
        }

        if ($this->option('save')) {
            $path = storage_path('explain-analyze.txt');
            file_put_contents($path, implode("\n", $output));
            $this->info("\nSaved to {$path}");
        }

        return 0;
    }
}
