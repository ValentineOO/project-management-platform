<?php

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeProjectWithOwner(): array
{
    $owner = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $owner->id]);
    $team->members()->attach($owner->id, ['role' => 'owner']);
    $project = Project::factory()->create(['team_id' => $team->id, 'owner_id' => $owner->id]);
    $project->members()->attach($owner->id, ['role' => 'manager']);

    return [$owner, $project];
}

describe('task creation', function () {
    it('project member can create a task', function () {
        [$owner, $project] = makeProjectWithOwner();

        $response = $this->actingAs($owner)
            ->postJson("/api/projects/{$project->id}/tasks", [
                'title' => 'Fix login bug',
                'priority' => 'high',
            ])
            ->assertStatus(201)
            ->assertJsonPath('task.title', 'Fix login bug');

        expect(ActivityLog::where('action', 'task.created')->count())->toBe(1);
    });

    it('outsider cannot create a task', function () {
        [, $project] = makeProjectWithOwner();

        $this->actingAs(User::factory()->create())
            ->postJson("/api/projects/{$project->id}/tasks", ['title' => 'Sneaky task'])
            ->assertStatus(403);
    });
});

describe('task listing', function () {
    it('returns cursor-paginated tasks', function () {
        [$owner, $project] = makeProjectWithOwner();
        Task::factory()->count(5)->create(['project_id' => $project->id, 'reporter_id' => $owner->id]);

        $this->actingAs($owner)
            ->getJson("/api/projects/{$project->id}/tasks")
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure(['data', 'next_cursor', 'next_page_url', 'prev_cursor']);
    });

    it('filters tasks by status', function () {
        [$owner, $project] = makeProjectWithOwner();
        Task::factory()->count(2)->create(['project_id' => $project->id, 'reporter_id' => $owner->id, 'status' => 'todo']);
        Task::factory()->count(3)->create(['project_id' => $project->id, 'reporter_id' => $owner->id, 'status' => 'done']);

        $this->actingAs($owner)
            ->getJson("/api/projects/{$project->id}/tasks?status=done")
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });
});

describe('task update with optimistic concurrency', function () {
    it('updates task and increments version', function () {
        [$owner, $project] = makeProjectWithOwner();
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'reporter_id' => $owner->id,
            'status' => 'todo',
            'version' => 1,
        ]);

        $this->actingAs($owner)
            ->patchJson("/api/tasks/{$task->id}", [
                'version' => 1,
                'status' => 'in_progress',
            ])
            ->assertOk()
            ->assertJsonPath('task.version', 2)
            ->assertJsonPath('task.status', 'in_progress');

        expect(ActivityLog::where('action', 'task.updated')->count())->toBe(1);
    });

    it('returns 409 on stale version', function () {
        [$owner, $project] = makeProjectWithOwner();
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'reporter_id' => $owner->id,
            'version' => 2,
        ]);

        $this->actingAs($owner)
            ->patchJson("/api/tasks/{$task->id}", [
                'version' => 1,
                'status' => 'done',
            ])
            ->assertStatus(409);
    });
});

describe('task deletion', function () {
    it('reporter can soft-delete a task', function () {
        [$owner, $project] = makeProjectWithOwner();
        $task = Task::factory()->create(['project_id' => $project->id, 'reporter_id' => $owner->id]);

        $this->actingAs($owner)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
        expect(ActivityLog::where('action', 'task.deleted')->count())->toBe(1);
    });
});
