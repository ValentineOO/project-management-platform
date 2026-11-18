<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    private const TEAMS = 20;
    private const USERS = 150;
    private const PROJECTS_PER_TEAM = 5;
    private const TASKS_PER_PROJECT = 500;

    private array $statuses = ['todo', 'in_progress', 'in_review', 'done'];
    private array $priorities = ['low', 'medium', 'high', 'critical'];

    // Weighted distributions that mirror real project velocity
    private array $statusWeights = [40, 25, 15, 20];
    private array $priorityWeights = [30, 35, 25, 10];

    private array $titleVerbs = [
        'Fix', 'Add', 'Refactor', 'Implement', 'Debug', 'Write tests for',
        'Optimize', 'Review', 'Deploy', 'Remove', 'Update', 'Migrate',
    ];

    private array $titleSubjects = [
        'authentication flow', 'dashboard query', 'API rate limiter',
        'database indexes', 'caching layer', 'task drag-and-drop',
        'notification service', 'search endpoint', 'file upload handler',
        'user profile page', 'billing integration', 'activity log pruning',
        'CI/CD pipeline', 'error tracking', 'password reset flow',
        'WebSocket connection', 'export to CSV', 'dark mode toggle',
        'email templates', 'session management', 'token refresh logic',
        'avatar upload', 'audit trail query', 'onboarding wizard',
    ];

    private array $teamNames = [
        'Atlas Engineering', 'Beacon Platform', 'Circuit Labs',
        'Delta Systems', 'Echo Framework', 'Forge Solutions',
        'Grid Technologies', 'Helix Studio', 'Ion Software',
        'Juno Collective', 'Kinetic Works', 'Lunar Builds',
        'Mosaic Digital', 'Nova Engineering', 'Orbit Tech',
        'Pulse Systems', 'Quantum Apps', 'Relay Software',
        'Summit Platform', 'Terra Labs',
    ];

    public function run(): void
    {
        $start = microtime(true);

        $this->command->info('Seeding demo data — simulating 6 months of project activity');

        $this->command->info('  → Creating users...');
        $users = $this->createUsers();

        $this->command->info('  → Creating teams and assigning members...');
        [$teamRows, $teamMemberMap] = $this->createTeams($users);

        $this->command->info('  → Creating projects...');
        [$projectRows, $projectMemberMap] = $this->createProjects($teamRows, $teamMemberMap);

        $this->command->info("  → Seeding " . number_format(count($projectRows) * self::TASKS_PER_PROJECT) . " tasks (chunked inserts)...");
        $taskIds = $this->createTasks($projectRows, $projectMemberMap);

        $this->command->info('  → Generating activity logs...');
        $logCount = $this->createActivityLogs($taskIds, $users);

        $elapsed = round(microtime(true) - $start, 1);
        $this->command->info('');
        $this->command->info("  Done in {$elapsed}s — " .
            number_format(count($taskIds)) . " tasks, " .
            number_format($logCount) . " activity logs, " .
            count($users) . " users across " . self::TEAMS . " teams."
        );
    }

    private function createUsers(): array
    {
        $password = Hash::make('password');
        $rows = [];

        for ($i = 1; $i <= self::USERS; $i++) {
            $name = fake()->name();
            $rows[] = [
                'id' => $i,
                'name' => $name,
                'email' => fake()->unique()->safeEmail(),
                'email_verified_at' => now(),
                'password' => $password,
                'remember_token' => Str::random(10),
                'created_at' => now()->subMonths(rand(1, 6)),
                'updated_at' => now(),
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        return $rows;
    }

    private function createTeams(array $users): array
    {
        $teamRows = [];
        $teamMemberMap = [];
        $teamMemberRows = [];
        $userIds = array_column($users, 'id');

        foreach ($this->teamNames as $i => $name) {
            $teamId = $i + 1;
            $ownerId = $userIds[array_rand($userIds)];

            $teamRows[] = [
                'id' => $teamId,
                'owner_id' => $ownerId,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => fake()->sentence(),
                'created_at' => now()->subMonths(rand(2, 6)),
                'updated_at' => now(),
            ];

            // 6–12 members per team (realistic team size)
            $memberIds = array_slice(
                array_unique(array_merge([$ownerId], fake()->randomElements($userIds, rand(6, 12)))),
                0,
                12
            );

            $teamMemberMap[$teamId] = $memberIds;

            foreach ($memberIds as $userId) {
                $role = $userId === $ownerId ? 'owner' : fake()->randomElement(['admin', 'member', 'member', 'member']);
                $teamMemberRows[] = [
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'role' => $role,
                    'joined_at' => now()->subMonths(rand(1, 5)),
                ];
            }
        }

        DB::table('teams')->insert($teamRows);
        foreach (array_chunk($teamMemberRows, 200) as $chunk) {
            DB::table('team_members')->insert($chunk);
        }

        return [$teamRows, $teamMemberMap];
    }

    private function createProjects(array $teamRows, array $teamMemberMap): array
    {
        $projectRows = [];
        $projectMemberMap = [];
        $projectMemberRows = [];
        $projectId = 1;
        $statuses = ['active', 'active', 'active', 'completed', 'archived'];

        foreach ($teamRows as $team) {
            for ($p = 0; $p < self::PROJECTS_PER_TEAM; $p++) {
                $teamMembers = $teamMemberMap[$team['id']];
                $ownerId = $teamMembers[array_rand($teamMembers)];

                $projectRows[] = [
                    'id' => $projectId,
                    'team_id' => $team['id'],
                    'owner_id' => $ownerId,
                    'name' => $this->projectName(),
                    'description' => fake()->paragraph(),
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => now()->subMonths(rand(1, 5)),
                    'updated_at' => now(),
                ];

                $memberIds = array_slice(
                    array_unique(array_merge([$ownerId], fake()->randomElements($teamMembers, rand(3, 6)))),
                    0,
                    8
                );

                $projectMemberMap[$projectId] = $memberIds;

                foreach ($memberIds as $userId) {
                    $role = $userId === $ownerId ? 'manager' : fake()->randomElement(['member', 'member', 'viewer']);
                    $projectMemberRows[] = [
                        'project_id' => $projectId,
                        'user_id' => $userId,
                        'role' => $role,
                        'joined_at' => now()->subMonths(rand(1, 4)),
                    ];
                }

                $projectId++;
            }
        }

        DB::table('projects')->insert($projectRows);
        foreach (array_chunk($projectMemberRows, 200) as $chunk) {
            DB::table('project_members')->insert($chunk);
        }

        return [$projectRows, $projectMemberMap];
    }

    private function createTasks(array $projectRows, array $projectMemberMap): array
    {
        $allTaskIds = [];
        $taskId = 1;

        foreach ($projectRows as $project) {
            $members = $projectMemberMap[$project['id']];
            $chunk = [];
            $projectStart = now()->subMonths(rand(1, 4));

            for ($t = 0; $t < self::TASKS_PER_PROJECT; $t++) {
                $status = $this->weighted($this->statuses, $this->statusWeights);
                $createdAt = (clone $projectStart)->addDays(rand(0, 120))->addMinutes(rand(0, 1440));

                $chunk[] = [
                    'id' => $taskId,
                    'project_id' => $project['id'],
                    'reporter_id' => $members[array_rand($members)],
                    'assignee_id' => rand(1, 10) <= 7 ? $members[array_rand($members)] : null,
                    'title' => $this->taskTitle(),
                    'description' => rand(1, 3) === 1 ? fake()->paragraph() : null,
                    'status' => $status,
                    'priority' => $this->weighted($this->priorities, $this->priorityWeights),
                    'due_date' => rand(1, 2) === 1
                        ? (clone $createdAt)->addDays(rand(-10, 30))->format('Y-m-d')
                        : null,
                    'position' => $t + 1,
                    'version' => rand(1, 5),
                    'created_at' => $createdAt,
                    'updated_at' => $status === 'todo'
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

    private function createActivityLogs(array $taskIds, array $users): int
    {
        $userIds = array_column($users, 'id');

        // Build a task_id → project_id map for denormalized project_id column
        $taskProjectMap = DB::table('tasks')
            ->whereIn('id', $taskIds)
            ->pluck('project_id', 'id')
            ->all();

        $rows = [];
        $logId = 1;
        $count = 0;

        foreach ($taskIds as $taskId) {
            $projectId = $taskProjectMap[$taskId] ?? null;

            // Every task has a created log
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

            // ~40% of tasks have 1-3 update logs
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
                        'payload' => json_encode(['status' => $this->weighted($this->statuses, $this->statusWeights)]),
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

        if (!empty($rows)) {
            DB::table('activity_logs')->insert($rows);
        }

        return $count;
    }

    private function taskTitle(): string
    {
        return $this->titleVerbs[array_rand($this->titleVerbs)]
            . ' '
            . $this->titleSubjects[array_rand($this->titleSubjects)];
    }

    private function projectName(): string
    {
        $adjectives = ['Core', 'Next', 'Unified', 'Edge', 'Smart', 'Rapid', 'Deep', 'Open', 'Pro'];
        $nouns = ['Platform', 'Engine', 'Service', 'API', 'Portal', 'Hub', 'Pipeline', 'Suite', 'Toolkit'];
        return $adjectives[array_rand($adjectives)] . ' ' . $nouns[array_rand($nouns)];
    }

    private function weighted(array $items, array $weights): string
    {
        $rand = rand(1, 100);
        $cumulative = 0;
        foreach ($items as $i => $item) {
            $cumulative += $weights[$i];
            if ($rand <= $cumulative) {
                return $item;
            }
        }
        return $items[array_key_last($items)];
    }
}
