<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
        return $task->project->team->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Task $task): bool
    {
        return $task->project->team->members()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Task $task): bool
    {
        return $task->reporter_id === $user->id
            || $task->project->team->members()
                ->where('user_id', $user->id)
                ->whereIn('team_members.role', ['owner', 'admin'])
                ->exists();
    }
}
