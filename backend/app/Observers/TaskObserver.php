<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function created(Task $task): void
    {
        ActivityLog::create([
            'causer_id' => Auth::id(),
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.created',
            'payload' => ['title' => $task->title, 'status' => $task->status],
        ]);
    }

    public function updated(Task $task): void
    {
        $tracked = array_intersect_key(
            $task->getChanges(),
            array_flip(['status', 'priority', 'assignee_id', 'title', 'due_date'])
        );

        if (empty($tracked)) {
            return;
        }

        ActivityLog::create([
            'causer_id' => Auth::id(),
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.updated',
            'payload' => $tracked,
        ]);
    }

    public function deleted(Task $task): void
    {
        ActivityLog::create([
            'causer_id' => Auth::id(),
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.deleted',
            'payload' => ['title' => $task->title],
        ]);
    }
}
