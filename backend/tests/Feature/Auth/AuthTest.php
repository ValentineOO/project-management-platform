<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('register', function () {
    it('creates a user and returns 201', function () {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    });

    it('rejects duplicate email', function () {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Another',
            'email' => 'taken@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    });

    it('requires password confirmation', function () {
        $this->postJson('/api/auth/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'password',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    });
});

describe('login', function () {
    it('returns user on valid credentials', function () {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->assertOk()->assertJsonStructure(['user' => ['id', 'email']]);
    });

    it('rejects invalid credentials', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    });
});

describe('logout', function () {
    it('logs out authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);
    });

    it('rejects unauthenticated request', function () {
        $this->postJson('/api/auth/logout')->assertStatus(401);
    });
});

describe('me', function () {
    it('returns authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    });

    it('rejects unauthenticated request', function () {
        $this->getJson('/api/auth/me')->assertStatus(401);
    });
});
