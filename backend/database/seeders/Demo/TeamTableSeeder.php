<?php

namespace Database\Seeders\Demo;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TeamTableSeeder
{
    public function __construct(private readonly Command $command) {}

    /**
     * @param  array<int, array<string, mixed>>  $users
     * @return array{array<int, array<string, mixed>>, array<int, int[]>}
     */
    public function run(array $users): array
    {
        $this->command->info('  → Creating teams and assigning members…');

        $userIds = array_column($users, 'id');
        $teamRows = [];
        $teamMemberMap = [];
        $teamMemberRows = [];

        foreach (DemoData::TEAM_NAMES as $i => $name) {
            $teamId  = $i + 1;
            $ownerId = $userIds[array_rand($userIds)];

            $teamRows[] = [
                'id'          => $teamId,
                'owner_id'    => $ownerId,
                'name'        => $name,
                'slug'        => Str::slug($name),
                'description' => fake()->sentence(),
                'created_at'  => now()->subMonths(rand(2, 6)),
                'updated_at'  => now(),
            ];

            $memberIds = array_slice(
                array_unique(array_merge([$ownerId], fake()->randomElements($userIds, rand(6, 12)))),
                0, 12
            );

            $teamMemberMap[$teamId] = $memberIds;

            foreach ($memberIds as $userId) {
                $role = $userId === $ownerId
                    ? 'owner'
                    : fake()->randomElement(['admin', 'member', 'member', 'member']);

                $teamMemberRows[] = [
                    'team_id'   => $teamId,
                    'user_id'   => $userId,
                    'role'      => $role,
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
}
