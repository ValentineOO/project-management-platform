<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
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

        return response()->json(['team' => $team], 201);
    }

    public function show(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        return response()->json([
            'team' => $team->load('owner', 'members'),
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $count = Team::where('slug', 'like', "{$slug}%")->count();

        return $count > 0 ? "{$slug}-{$count}" : $slug;
    }
}
