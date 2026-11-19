<?php

namespace App\Listeners;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;

class ProvisionStarterWorkspace
{
    public function handle(Registered $event): void
    {
        $user = $event->user;

        $team = Team::create([
            'owner_id'    => $user->id,
            'name'        => "{$user->name}'s Workspace",
            'slug'        => Str::slug($user->name) . '-' . Str::random(5),
            'description' => 'Your personal workspace. Invite teammates to collaborate.',
        ]);

        $team->members()->attach($user->id, [
            'role'      => 'owner',
            'joined_at' => now(),
        ]);

        $project = Project::create([
            'team_id'     => $team->id,
            'owner_id'    => $user->id,
            'name'        => 'Getting Started',
            'description' => 'A sample project to help you explore the platform.',
            'status'      => 'active',
        ]);

        $project->members()->attach($user->id, [
            'role'      => 'manager',
            'joined_at' => now(),
        ]);
    }
}
