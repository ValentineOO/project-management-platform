<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private const TTL = 300;

    public function statsFor(User $user): array
    {
        return Cache::remember("dashboard.{$user->id}", self::TTL, fn () => $this->compute($user));
    }

    public function invalidate(int $userId): void
    {
        Cache::forget("dashboard.{$userId}");
    }

    private function compute(User $user): array
    {
        $teamIds = $user->teams()->pluck('teams.id');
        $projectIds = DB::table('projects')
            ->whereIn('team_id', $teamIds)
            ->whereNull('deleted_at')
            ->pluck('id');

        $projectStats = DB::table('projects')
            ->whereIn('team_id', $teamIds)
            ->whereNull('deleted_at')
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $tasksByStatus = DB::table('tasks')
            ->where('assignee_id', $user->id)
            ->whereNull('deleted_at')
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $overdueCount = DB::table('tasks')
            ->where('assignee_id', $user->id)
            ->whereNull('deleted_at')
            ->whereNotIn('status', ['done'])
            ->where('due_date', '<', now())
            ->whereNotNull('due_date')
            ->count();

        $recentActivity = ActivityLog::with('causer:id,name')
            ->whereIn('project_id', $projectIds)
            ->latest('created_at')
            ->limit(10)
            ->select(['causer_id', 'project_id', 'subject_id', 'action', 'payload', 'created_at']);

        return [
            'teams' => $teamIds->count(),
            'projects' => [
                'total' => $projectIds->count(),
                'by_status' => $projectStats,
            ],
            'tasks' => [
                'assigned_to_me' => [
                    'total' => $tasksByStatus->sum(),
                    'by_status' => $tasksByStatus,
                ],
                'overdue' => $overdueCount,
            ],
            'recent_activity' => $recentActivity,
        ];
    }
}
