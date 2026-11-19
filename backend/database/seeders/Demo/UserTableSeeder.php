<?php

namespace Database\Seeders\Demo;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserTableSeeder
{
    public function __construct(private readonly Command $command) {}

    /** @return array<int, array<string, mixed>> */
    public function run(): array
    {
        $this->command->info('  → Creating users…');

        $password = Hash::make('password');
        $rows = [];

        $rows[] = [
            'id'                => 1,
            'name'              => 'Demo User',
            'email'             => 'demo@codefyve.test',
            'email_verified_at' => now(),
            'password'          => $password,
            'remember_token'    => Str::random(10),
            'created_at'        => now()->subMonths(6),
            'updated_at'        => now(),
        ];

        for ($i = 2; $i <= DemoData::USERS; $i++) {
            $rows[] = [
                'id'                => $i,
                'name'              => fake()->name(),
                'email'             => fake()->unique()->safeEmail(),
                'email_verified_at' => now(),
                'password'          => $password,
                'remember_token'    => Str::random(10),
                'created_at'        => now()->subMonths(rand(1, 6)),
                'updated_at'        => now(),
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        return $rows;
    }
}
