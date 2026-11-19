<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Team;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teams = $request->user()
            ->teams()
            ->withPivot('role', 'joined_at')
            ->latest('team_members.joined_at')
            ->get();

        return response()->json(['teams' => $teams]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $team = Team::create([
            'owner_id' => $request->user()->id,
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        $team->members()->attach($request->user()->id, ['role' => 'owner']);

        $this->log($request->user()->id, $team, 'team.created', ['name' => $team->name]);

        return response()->json(['team' => $team], 201);
    }

    public function show(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        return response()->json([
            'team' => $team->load('owner', 'members'),
        ]);
    }

    public function update(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $team->update($validated);

        $this->log($request->user()->id, $team, 'team.updated', ['name' => $team->name]);

        return response()->json(['team' => $team]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $this->authorize('delete', $team);

        $this->log(auth()->id(), $team, 'team.deleted', ['name' => $team->name]);

        $team->delete();

        return response()->json(null, 204);
    }

    public function addMember(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => bcrypt($validated['email']),
                'email_verified_at' => now(),
            ],
        );

        if ($team->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['errors' => ['email' => 'This person is already a member of the team.']], 422);
        }

        $team->members()->attach($user->id, ['role' => 'member', 'joined_at' => now()]);

        $this->log($request->user()->id, $team, 'team.member_added', [
            'member_name' => $user->name,
            'member_email' => $user->email,
        ]);

        return response()->json([
            'member' => $user->only(['id', 'name', 'email']) + ['pivot' => ['role' => 'member']],
        ], 201);
    }

    public function removeMember(Request $request, Team $team, User $user): JsonResponse
    {
        $this->authorize('update', $team);

        if ($team->owner_id === $user->id) {
            return response()->json(['message' => 'The team owner cannot be removed.'], 422);
        }

        $team->members()->detach($user->id);

        $this->log($request->user()->id, $team, 'team.member_removed', [
            'member_name' => $user->name,
        ]);

        return response()->json(null, 204);
    }

    private function log(int $causerId, Team $team, string $action, array $payload): void
    {
        ActivityLog::create([
            'causer_id' => $causerId,
            'project_id' => null,
            'subject_type' => Team::class,
            'subject_id' => $team->id,
            'action' => $action,
            'payload' => $payload,
        ]);

        app(DashboardService::class)->invalidate($causerId);
    }

    private function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $count = Team::where('slug', 'like', "{$slug}%")->count();

        return $count > 0 ? "{$slug}-{$count}" : $slug;
    }
}
