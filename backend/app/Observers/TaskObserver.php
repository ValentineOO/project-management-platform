<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Task;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function created(Task $task): void
    {
        ActivityLog::create([
            'causer_id' => Auth::id(),
            'project_id' => $task->project_id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.created',
            'payload' => ['title' => $task->title, 'status' => $task->status],
        ]);

        $this->invalidateDashboard($task);
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
            'project_id' => $task->project_id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.updated',
            'payload' => $tracked,
        ]);

        $this->invalidateDashboard($task);
    }

    public function deleted(Task $task): void
    {
        ActivityLog::create([
            'causer_id' => Auth::id(),
            'project_id' => $task->project_id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'task.deleted',
            'payload' => ['title' => $task->title],
        ]);

        $this->invalidateDashboard($task);
    }

    private function invalidateDashboard(Task $task): void
    {
        if ($task->assignee_id) {
            app(DashboardService::class)->invalidate($task->assignee_id);
        }

        if (Auth::id()) {
            app(DashboardService::class)->invalidate(Auth::id());
        }
    }
}
