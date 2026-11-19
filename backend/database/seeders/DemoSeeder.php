<?php

namespace Database\Seeders;

use Database\Seeders\Demo\ActivityLogTableSeeder;
use Database\Seeders\Demo\DemoData;
use Database\Seeders\Demo\ProjectTableSeeder;
use Database\Seeders\Demo\TaskTableSeeder;
use Database\Seeders\Demo\TeamTableSeeder;
use Database\Seeders\Demo\UserTableSeeder;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $start = microtime(true);

        $this->command->info('Seeding demo data — simulating 6 months of project activity');

        $users = (new UserTableSeeder($this->command))->run();

        [$teamRows, $teamMemberMap] = (new TeamTableSeeder($this->command))->run($users);

        [$projectRows, $projectMemberMap] = (new ProjectTableSeeder($this->command))->run($teamRows, $teamMemberMap);

        $taskIds = (new TaskTableSeeder($this->command))->run($projectRows, $projectMemberMap);

        $logCount = (new ActivityLogTableSeeder($this->command))->run($taskIds, $users);

        $elapsed = round(microtime(true) - $start, 1);
        $this->command->info('');
        $this->command->info(
            "  Done in {$elapsed}s — "
            . number_format(count($taskIds)) . ' tasks, '
            . number_format($logCount) . ' activity logs, '
            . count($users) . ' users across ' . DemoData::TEAMS . ' teams.'
        );
        $this->command->info('');
        $this->command->info('  Demo login:  demo@codefyve.test  /  password');
    }
}
