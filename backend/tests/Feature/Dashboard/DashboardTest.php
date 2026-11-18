<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

function makeDashboardFixture(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $team->members()->attach($user->id, ['role' => 'owner']);
    $project = Project::factory()->create(['team_id' => $team->id, 'owner_id' => $user->id]);

    Task::factory()->count(2)->create([
        'project_id' => $project->id,
        'reporter_id' => $user->id,
        'assignee_id' => $user->id,
        'status' => 'todo',
    ]);
    Task::factory()->count(1)->create([
        'project_id' => $project->id,
        'reporter_id' => $user->id,
        'assignee_id' => $user->id,
        'status' => 'in_progress',
    ]);

    return [$user, $team, $project];
}

it('returns dashboard stats with correct shape', function () {
    [$user] = makeDashboardFixture();

    $this->actingAs($user)
        ->getJson('/api/dashboard')
        ->assertOk()
        ->assertJsonStructure([
            'teams',
            'projects' => ['total', 'by_status'],
            'tasks' => [
                'assigned_to_me' => ['total', 'by_status'],
                'overdue',
            ],
            'recent_activity',
        ]);
});

it('returns correct task counts for assigned user', function () {
    [$user] = makeDashboardFixture();

    $response = $this->actingAs($user)
        ->getJson('/api/dashboard')
        ->assertOk();

    expect($response->json('tasks.assigned_to_me.total'))->toBe(3)
        ->and($response->json('tasks.assigned_to_me.by_status.todo'))->toBe(2)
        ->and($response->json('tasks.assigned_to_me.by_status.in_progress'))->toBe(1);
});

it('caches the result after first call', function () {
    [$user] = makeDashboardFixture();

    expect(Cache::has("dashboard.{$user->id}"))->toBeFalse();

    $this->actingAs($user)->getJson('/api/dashboard')->assertOk();

    expect(Cache::has("dashboard.{$user->id}"))->toBeTrue();
});

it('invalidates cache on task write', function () {
    [$user, , $project] = makeDashboardFixture();

    $service = app(DashboardService::class);
    $service->statsFor($user);

    $this->actingAs($user)
        ->postJson("/api/projects/{$project->id}/tasks", [
            'title' => 'New task triggers invalidation',
            'assignee_id' => $user->id,
        ]);

    expect(Cache::has("dashboard.{$user->id}"))->toBeFalse();
});
