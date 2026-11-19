<?php

namespace Database\Seeders\Demo;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProjectTableSeeder
{
    private const STATUSES = ['active', 'active', 'active', 'completed', 'archived'];

    public function __construct(private readonly Command $command) {}

    /**
     * @param  array<int, array<string, mixed>>  $teamRows
     * @param  array<int, int[]>                 $teamMemberMap
     * @return array{array<int, array<string, mixed>>, array<int, int[]>}
     */
    public function run(array $teamRows, array $teamMemberMap): array
    {
        $this->command->info('  → Creating projects…');

        $projectRows = [];
        $projectMemberMap = [];
        $projectMemberRows = [];
        $projectId = 1;

        foreach ($teamRows as $team) {
            for ($p = 0; $p < DemoData::PROJECTS_PER_TEAM; $p++) {
                $teamMembers = $teamMemberMap[$team['id']];
                $ownerId     = $teamMembers[array_rand($teamMembers)];

                $projectRows[] = [
                    'id'          => $projectId,
                    'team_id'     => $team['id'],
                    'owner_id'    => $ownerId,
                    'name'        => $this->projectName(),
                    'description' => fake()->paragraph(),
                    'status'      => self::STATUSES[array_rand(self::STATUSES)],
                    'created_at'  => now()->subMonths(rand(1, 5)),
                    'updated_at'  => now(),
                ];

                $memberIds = array_slice(
                    array_unique(array_merge([$ownerId], fake()->randomElements($teamMembers, rand(3, 6)))),
                    0, 8
                );

                $projectMemberMap[$projectId] = $memberIds;

                foreach ($memberIds as $userId) {
                    $role = $userId === $ownerId
                        ? 'manager'
                        : fake()->randomElement(['member', 'member', 'viewer']);

                    $projectMemberRows[] = [
                        'project_id' => $projectId,
                        'user_id'    => $userId,
                        'role'       => $role,
                        'joined_at'  => now()->subMonths(rand(1, 4)),
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

    private function projectName(): string
    {
        return DemoData::PROJECT_ADJECTIVES[array_rand(DemoData::PROJECT_ADJECTIVES)]
            . ' '
            . DemoData::PROJECT_NOUNS[array_rand(DemoData::PROJECT_NOUNS)];
    }
}
