<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSearchFixture(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $user->id]);
    $team->members()->attach($user->id, ['role' => 'owner']);
    $project = Project::factory()->create([
        'team_id' => $team->id,
        'owner_id' => $user->id,
        'name' => 'Zephyr Platform',
    ]);
    $task = Task::factory()->create([
        'project_id' => $project->id,
        'reporter_id' => $user->id,
        'title' => 'Fix authentication middleware',
    ]);

    return [$user, $project, $task];
}

it('finds projects by name', function () {
    [$user] = makeSearchFixture();

    $this->actingAs($user)
        ->getJson('/api/search?q=Zephyr')
        ->assertOk()
        ->assertJsonCount(1, 'projects')
        ->assertJsonPath('projects.0.name', 'Zephyr Platform');
});

it('finds tasks by title', function () {
    [$user] = makeSearchFixture();

    $this->actingAs($user)
        ->getJson('/api/search?q=authentication')
        ->assertOk()
        ->assertJsonCount(1, 'tasks')
        ->assertJsonPath('tasks.0.title', 'Fix authentication middleware');
});

it('scopes results to user teams only', function () {
    [$user] = makeSearchFixture();
    $outsider = User::factory()->create();
    $otherTeam = Team::factory()->create(['owner_id' => $outsider->id]);
    $otherTeam->members()->attach($outsider->id, ['role' => 'owner']);
    Project::factory()->create([
        'team_id' => $otherTeam->id,
        'owner_id' => $outsider->id,
        'name' => 'Zephyr Secret Project',
    ]);

    $this->actingAs($user)
        ->getJson('/api/search?q=Zephyr')
        ->assertOk()
        ->assertJsonCount(1, 'projects');
});

it('filters by type=projects only', function () {
    [$user] = makeSearchFixture();

    $response = $this->actingAs($user)
        ->getJson('/api/search?q=Zephyr&type=projects')
        ->assertOk();

    expect($response->json())->toHaveKey('projects')
        ->and($response->json())->not->toHaveKey('tasks');
});

it('rejects query shorter than 2 characters', function () {
    [$user] = makeSearchFixture();

    $this->actingAs($user)
        ->getJson('/api/search?q=x')
        ->assertStatus(422);
});
