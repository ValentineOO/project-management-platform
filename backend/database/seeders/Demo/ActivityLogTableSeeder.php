<?php

namespace Database\Seeders\Demo;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ActivityLogTableSeeder
{
    public function __construct(private readonly Command $command) {}

    /**
     * @param  int[]  $taskIds
     * @param  array<int, array<string, mixed>>  $users
     */
    public function run(array $taskIds, array $users): int
    {
        $this->command->info('  → Generating activity logs…');

        $userIds = array_column($users, 'id');

        $taskProjectMap = DB::table('tasks')
            ->whereIn('id', $taskIds)
            ->pluck('project_id', 'id')
            ->all();

        $rows = [];
        $logId = 1;
        $count = 0;

        foreach ($taskIds as $taskId) {
            $projectId = $taskProjectMap[$taskId] ?? null;

            $rows[] = [
                'id' => $logId++,
                'causer_id' => $userIds[array_rand($userIds)],
                'project_id' => $projectId,
                'subject_type' => 'App\Models\Task',
                'subject_id' => $taskId,
                'action' => 'task.created',
                'payload' => json_encode(['status' => 'todo']),
                'created_at' => now()->subDays(rand(1, 120)),
            ];
            $count++;

            if (rand(1, 10) <= 4) {
                $updates = rand(1, 3);
                for ($u = 0; $u < $updates; $u++) {
                    $rows[] = [
                        'id' => $logId++,
                        'causer_id' => $userIds[array_rand($userIds)],
                        'project_id' => $projectId,
                        'subject_type' => 'App\Models\Task',
                        'subject_id' => $taskId,
                        'action' => 'task.updated',
                        'payload' => json_encode([
                            'status' => DemoData::weighted(DemoData::STATUSES, DemoData::STATUS_WEIGHTS),
                        ]),
                        'created_at' => now()->subDays(rand(0, 30)),
                    ];
                    $count++;
                }
            }

            if (count($rows) >= 1000) {
                DB::table('activity_logs')->insert($rows);
                $rows = [];
            }
        }

        if (! empty($rows)) {
            DB::table('activity_logs')->insert($rows);
        }

        return $count;
    }
}
