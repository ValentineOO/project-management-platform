<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'owner_id' => User::factory(),
            'name' => $this->faker->bs(),
            'description' => $this->faker->sentence(),
            'status' => 'active',
        ];
    }
}
