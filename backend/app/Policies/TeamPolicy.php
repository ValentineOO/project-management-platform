<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $team->members()->where('user_id', $user->id)->exists();
    }

    public function createProject(User $user, Team $team): bool
    {
        return $team->members()
            ->where('user_id', $user->id)
            ->whereIn('team_members.role', ['owner', 'admin'])
            ->exists();
    }

    public function update(User $user, Team $team): bool
    {
        return $team->owner_id === $user->id;
    }

    public function delete(User $user, Team $team): bool
    {
        return $team->owner_id === $user->id;
    }
}
