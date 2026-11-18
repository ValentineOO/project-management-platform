<?php

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeTeamWithOwner(): array
{
    $owner = User::factory()->create();
    $team = Team::factory()->create(['owner_id' => $owner->id]);
    $team->members()->attach($owner->id, ['role' => 'owner']);
    return [$owner, $team];
}

describe('project creation', function () {
    it('owner can create a project', function () {
        [$owner, $team] = makeTeamWithOwner();

        $this->actingAs($owner)
            ->postJson("/api/teams/{$team->id}/projects", [
                'name' => 'Alpha Project',
                'description' => 'First project',
            ])
            ->assertStatus(201)
            ->assertJsonPath('project.name', 'Alpha Project');

        $this->assertDatabaseHas('projects', ['name' => 'Alpha Project', 'team_id' => $team->id]);
    });

    it('non-member cannot create a project', function () {
        [, $team] = makeTeamWithOwner();
        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->postJson("/api/teams/{$team->id}/projects", ['name' => 'Sneaky'])
            ->assertStatus(403);
    });

    it('member without admin role cannot create a project', function () {
        [$owner, $team] = makeTeamWithOwner();
        $member = User::factory()->create();
        $team->members()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member)
            ->postJson("/api/teams/{$team->id}/projects", ['name' => 'Attempt'])
            ->assertStatus(403);
    });
});

describe('project listing', function () {
    it('team member can list projects', function () {
        [$owner, $team] = makeTeamWithOwner();
        Project::factory()->count(3)->create(['team_id' => $team->id, 'owner_id' => $owner->id]);

        $this->actingAs($owner)
            ->getJson("/api/teams/{$team->id}/projects")
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });
});

describe('project update', function () {
    it('owner can update project name and status', function () {
        [$owner, $team] = makeTeamWithOwner();
        $project = Project::factory()->create(['team_id' => $team->id, 'owner_id' => $owner->id]);

        $this->actingAs($owner)
            ->patchJson("/api/projects/{$project->id}", ['status' => 'archived'])
            ->assertOk()
            ->assertJsonPath('project.status', 'archived');
    });

    it('non-member cannot update project', function () {
        [$owner, $team] = makeTeamWithOwner();
        $project = Project::factory()->create(['team_id' => $team->id, 'owner_id' => $owner->id]);
        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->patchJson("/api/projects/{$project->id}", ['name' => 'Hijacked'])
            ->assertStatus(403);
    });
});

describe('project deletion', function () {
    it('owner can delete project (soft delete)', function () {
        [$owner, $team] = makeTeamWithOwner();
        $project = Project::factory()->create(['team_id' => $team->id, 'owner_id' => $owner->id]);

        $this->actingAs($owner)
            ->deleteJson("/api/projects/{$project->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    });
});
