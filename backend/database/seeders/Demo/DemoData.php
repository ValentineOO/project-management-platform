<?php

namespace Database\Seeders\Demo;

class DemoData
{
    public const TEAMS = 20;
    public const USERS = 150;
    public const PROJECTS_PER_TEAM = 5;
    public const TASKS_PER_PROJECT = 500;

    public const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
    public const STATUS_WEIGHTS = [40, 25, 15, 20];
    public const PRIORITY_WEIGHTS = [30, 35, 25, 10];

    public const TEAM_NAMES = [
        'Atlas Engineering', 'Beacon Platform', 'Circuit Labs',
        'Delta Systems', 'Echo Framework', 'Forge Solutions',
        'Grid Technologies', 'Helix Studio', 'Ion Software',
        'Juno Collective', 'Kinetic Works', 'Lunar Builds',
        'Mosaic Digital', 'Nova Engineering', 'Orbit Tech',
        'Pulse Systems', 'Quantum Apps', 'Relay Software',
        'Summit Platform', 'Terra Labs',
    ];

    public const TASK_VERBS = [
        'Fix', 'Add', 'Refactor', 'Implement', 'Debug', 'Write tests for',
        'Optimize', 'Review', 'Deploy', 'Remove', 'Update', 'Migrate',
    ];

    public const TASK_SUBJECTS = [
        'authentication flow', 'dashboard query', 'API rate limiter',
        'database indexes', 'caching layer', 'task drag-and-drop',
        'notification service', 'search endpoint', 'file upload handler',
        'user profile page', 'billing integration', 'activity log pruning',
        'CI/CD pipeline', 'error tracking', 'password reset flow',
        'WebSocket connection', 'export to CSV', 'dark mode toggle',
        'email templates', 'session management', 'token refresh logic',
        'avatar upload', 'audit trail query', 'onboarding wizard',
    ];

    public const PROJECT_ADJECTIVES = ['Core', 'Next', 'Unified', 'Edge', 'Smart', 'Rapid', 'Deep', 'Open', 'Pro'];
    public const PROJECT_NOUNS = ['Platform', 'Engine', 'Service', 'API', 'Portal', 'Hub', 'Pipeline', 'Suite', 'Toolkit'];

    public static function weighted(array $items, array $weights): string
    {
        $rand = rand(1, 100);
        $cumulative = 0;
        foreach ($items as $i => $item) {
            $cumulative += $weights[$i];
            if ($rand <= $cumulative) {
                return $item;
            }
        }
        return $items[array_key_last($items)];
    }
}
