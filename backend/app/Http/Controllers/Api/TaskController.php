<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\TaskConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Services\DashboardService;
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
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(20);

        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('createTask', $project);

        $task = $project->tasks()->create([
            ...$request->validated(),
            'reporter_id' => $request->user()->id,
            'version'     => 1,
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

        $payload = $request->safe()->except('version');
        $user = $request->user();

        try {
            $task = DB::transaction(function () use ($task, $payload, $user, $request) {
                $affected = DB::table('tasks')
                    ->where('id', $task->id)
                    ->where('version', $request->version)
                    ->whereNull('deleted_at')
                    ->update(array_merge($payload, [
                        'version' => DB::raw('version + 1'),
                        'updated_at' => now(),
                    ]));

                if ($affected === 0) {
                    throw new TaskConflictException();
                }

                $task = $task->fresh();

                // Query builder bypasses the Eloquent observer; log explicitly inside the transaction
                $tracked = array_intersect_key(
                    $payload,
                    array_flip(['status', 'priority', 'assignee_id', 'title', 'due_date'])
                );

                if (!empty($tracked)) {
                    ActivityLog::create([
                        'causer_id' => $user->id,
                        'project_id' => $task->project_id,
                        'subject_type' => Task::class,
                        'subject_id' => $task->id,
                        'action' => 'task.updated',
                        'payload' => $tracked,
                    ]);
                }

                return $task;
            });
        } catch (TaskConflictException) {
            return response()->json([
                'message' => 'Conflict: task was modified by another user. Reload and retry.',
                'current' => $task->fresh(),
            ], 409);
        }

        $dash = app(DashboardService::class);
        $dash->invalidate($request->user()->id);
        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $dash->invalidate($task->assignee_id);
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
