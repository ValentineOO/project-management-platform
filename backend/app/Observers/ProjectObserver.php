<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;

class ProjectObserver
{
    public function created(Project $project): void
    {
        ActivityLog::create([
            'causer_id'    => Auth::id(),
            'project_id'   => $project->id,
            'subject_type' => Project::class,
            'subject_id'   => $project->id,
            'action'       => 'project.created',
            'payload'      => ['name' => $project->name],
        ]);

        $this->invalidateDashboard();
    }

    public function updated(Project $project): void
    {
        $tracked = array_intersect_key(
            $project->getChanges(),
            array_flip(['name', 'status', 'description']),
        );

        if (empty($tracked)) {
            return;
        }

        ActivityLog::create([
            'causer_id'    => Auth::id(),
            'project_id'   => $project->id,
            'subject_type' => Project::class,
            'subject_id'   => $project->id,
            'action'       => 'project.updated',
            'payload'      => array_merge(['name' => $project->name], $tracked),
        ]);

        $this->invalidateDashboard();
    }

    public function deleted(Project $project): void
    {
        ActivityLog::create([
            'causer_id'    => Auth::id(),
            'project_id'   => null,
            'subject_type' => Project::class,
            'subject_id'   => $project->id,
            'action'       => 'project.deleted',
            'payload'      => ['name' => $project->name],
        ]);

        $this->invalidateDashboard();
    }

    private function invalidateDashboard(): void
    {
        if (Auth::id()) {
            app(DashboardService::class)->invalidate(Auth::id());
        }
    }
}
