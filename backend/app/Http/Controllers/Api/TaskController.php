<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $tasks = $project->tasks()
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->assignee_id, fn($q, $v) => $q->where('assignee_id', $v))
            ->when($request->priority, fn($q, $v) => $q->where('priority', $v))
            ->orderBy('created_at')
            ->cursorPaginate(20);

        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('createTask', $project);

        $task = $project->tasks()->create([
            ...$request->validated(),
            'reporter_id' => $request->user()->id,
        ]);

        return response()->json(['task' => $task], 201);
    }

    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return response()->json([
            'task' => $task->load('assignee', 'reporter', 'project'),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        try {
            $task = DB::transaction(function () use ($request, $task) {
                $locked = Task::where('id', $task->id)
                    ->where('version', $request->version)
                    ->lockForUpdate()
                    ->firstOrFail();

                $locked->update(array_merge(
                    $request->safe()->except('version'),
                    ['version' => $locked->version + 1]
                ));

                return $locked->fresh();
            });
        } catch (ModelNotFoundException) {
            return response()->json([
                'message' => 'Conflict: task was modified by another user. Reload and retry.',
            ], 409);
        }

        return response()->json(['task' => $task]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(null, 204);
    }
}
