<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    public function index(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        $projects = $team->projects()
            ->withCount('tasks')
            ->cursorPaginate(20);

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request, Team $team): JsonResponse
    {
        $this->authorize('createProject', $team);

        $project = $team->projects()->create([
            ...$request->validated(),
            'owner_id' => $request->user()->id,
            'status'   => 'active',
        ]);

        $project->members()->attach($request->user()->id, ['role' => 'manager']);

        return response()->json(['project' => $project], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $taskStats = DB::table('tasks')
            ->where('project_id', $project->id)
            ->whereNull('deleted_at')
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'project' => $project->load(['owner', 'team', 'members' => fn ($q) => $q->select('users.id', 'users.name')]),
            'task_stats' => $taskStats,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json(['project' => $project]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(null, 204);
    }
}
