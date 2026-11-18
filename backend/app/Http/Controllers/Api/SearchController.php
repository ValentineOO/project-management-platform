<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
            'type' => ['sometimes', 'in:projects,tasks,all'],
        ]);

        $term = $request->string('q')->trim()->value();
        $type = $request->input('type', 'all');

        $teamIds = $request->user()->teams()->pluck('teams.id');
        $projectIds = DB::table('projects')
            ->whereIn('team_id', $teamIds)
            ->whereNull('deleted_at')
            ->pluck('id');

        $results = [];

        if (in_array($type, ['projects', 'all'])) {
            $results['projects'] = Project::whereIn('id', $projectIds)
                ->where(fn ($q) => $q
                    ->whereRaw('name ILIKE ?', ["%{$term}%"])
                    ->orWhereRaw('description ILIKE ?', ["%{$term}%"])
                )
                ->select(['id', 'name', 'description', 'status', 'team_id'])
                ->limit(10)
                ->get();
        }

        if (in_array($type, ['tasks', 'all'])) {
            $results['tasks'] = Task::whereIn('project_id', $projectIds)
                ->where(fn ($q) => $q
                    ->whereRaw('title ILIKE ?', ["%{$term}%"])
                    ->orWhereRaw('description ILIKE ?', ["%{$term}%"])
                )
                ->select(['id', 'title', 'status', 'priority', 'project_id', 'assignee_id'])
                ->limit(10)
                ->get();
        }

        return response()->json($results);
    }
}
