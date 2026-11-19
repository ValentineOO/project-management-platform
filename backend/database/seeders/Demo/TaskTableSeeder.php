<?php

namespace Database\Seeders\Demo;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TaskTableSeeder
{
    public function __construct(private readonly Command $command) {}

    /**
     * @param  array<int, array<string, mixed>>  $projectRows
     * @param  array<int, int[]>                 $projectMemberMap
     * @return int[]
     */
    public function run(array $projectRows, array $projectMemberMap): array
    {
        $total = number_format(count($projectRows) * DemoData::TASKS_PER_PROJECT);
        $this->command->info("  → Seeding {$total} tasks (chunked inserts)…");

        $allTaskIds = [];
        $taskId = 1;

        foreach ($projectRows as $project) {
            $members      = $projectMemberMap[$project['id']];
            $chunk        = [];
            $projectStart = now()->subMonths(rand(1, 4));

            for ($t = 0; $t < DemoData::TASKS_PER_PROJECT; $t++) {
                $status    = DemoData::weighted(DemoData::STATUSES, DemoData::STATUS_WEIGHTS);
                $createdAt = (clone $projectStart)->addDays(rand(0, 120))->addMinutes(rand(0, 1440));

                $chunk[] = [
                    'id'          => $taskId,
                    'project_id'  => $project['id'],
                    'reporter_id' => $members[array_rand($members)],
                    'assignee_id' => rand(1, 10) <= 7 ? $members[array_rand($members)] : null,
                    'title'       => $this->taskTitle(),
                    'description' => rand(1, 3) === 1 ? fake()->paragraph() : null,
                    'status'      => $status,
                    'priority'    => DemoData::weighted(DemoData::PRIORITIES, DemoData::PRIORITY_WEIGHTS),
                    'due_date'    => rand(1, 2) === 1
                        ? (clone $createdAt)->addDays(rand(-10, 30))->format('Y-m-d')
                        : null,
                    'position'    => $t + 1,
                    'version'     => rand(1, 5),
                    'created_at'  => $createdAt,
                    'updated_at'  => $status === 'todo'
                        ? $createdAt
                        : (clone $createdAt)->addDays(rand(1, 14)),
                ];

                $allTaskIds[] = $taskId;
                $taskId++;

                if (count($chunk) === 500) {
                    DB::table('tasks')->insert($chunk);
                    $chunk = [];
                }
            }

            if (!empty($chunk)) {
                DB::table('tasks')->insert($chunk);
            }
        }

        return $allTaskIds;
    }

    private function taskTitle(): string
    {
        return DemoData::TASK_VERBS[array_rand(DemoData::TASK_VERBS)]
            . ' '
            . DemoData::TASK_SUBJECTS[array_rand(DemoData::TASK_SUBJECTS)];
    }
}
