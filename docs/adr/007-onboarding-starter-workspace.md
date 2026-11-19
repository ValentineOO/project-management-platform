# ADR-007: Onboarding Starter Workspace Provisioning

**Date:** 2026-11-19

**Status:** Accepted

---

## Context

New users who register receive an empty dashboard with no teams or projects. This
creates a cold-start problem: the UI is meaningless until they manually create a
team, then a project, then tasks. For a productivity tool, first-run experience
is a retention signal: a user who sees empty state on day one is far more likely
to churn than one who lands in a working context.

We needed to automatically provision a sensible starter workspace on first
registration, covering a default team, a default project, and appropriate
membership roles for both.

---

## Decision

Provision the starter workspace synchronously inside a `Registered` event listener
(`ProvisionStarterWorkspace`) rather than queuing a background job. The listener:

1. Locks the user row inside the transaction (`lockForUpdate`) and checks for an
   existing team after acquiring the lock, so concurrent registration events for
   the same user are serialised rather than racing past the guard.
2. Wraps all inserts in a single `DB::transaction()`: if any step fails (team
   insert, member pivot, project insert, project member pivot), the whole operation
   rolls back and no partial workspace is left behind.
3. Attaches the user as `owner` on the team and `manager` on the project, matching
   the role model used throughout the rest of the application.

```php
public function handle(Registered $event): void
{
    // Fast path: skip the transaction entirely if already provisioned.
    if (Team::where('owner_id', $event->user->id)->exists()) return;

    DB::transaction(function () use ($event) {
        // Lock the user row to serialise concurrent provisioning attempts.
        $user = User::lockForUpdate()->findOrFail($event->user->id);

        if (Team::where('owner_id', $user->id)->exists()) return;

        $team    = Team::create([...]);
        $team->members()->attach($user->id, ['role' => 'owner', ...]);
        $project = Project::create([..., 'team_id' => $team->id]);
        $project->members()->attach($user->id, ['role' => 'manager', ...]);
    });
}
```

---

## Alternatives Considered

### Queued job (`implements ShouldQueue`)

Queuing the provisioning would decouple the work from the HTTP response and add
worker-based retry semantics. It was rejected for this use case because:

- **Race condition on first load.** The user is redirected to the dashboard
  immediately after registration. A queued job processed seconds later would
  still show an empty dashboard on that first visit. A synchronous listener
  ensures the workspace exists before the redirect fires.
- **Retry semantics add complexity without benefit.** Queue retries require
  idempotency guards to prevent duplicate provisioning on repeated delivery. We
  already need that guard for correctness in the synchronous path; queuing adds
  the retry mechanism but does not remove the need for the guard.
- **Low cost.** The provisioning operation consists of a small number of database
  writes and is expected to add negligible latency at the current application
  scale.

Queuing would be the right choice if the provisioning work were expensive (e.g.
uploading assets, calling external APIs, sending notifications) or if retries
were needed for reliability against transient failures. Neither applies here.

### Lazy provisioning (create on first dashboard load)

An alternative is to provision on first access rather than at registration time.
This was rejected because it moves business-logic side-effects into a read path
(a GET request), making the behaviour harder to reason about and test, and
creating a subtle race if the same user triggers two concurrent requests before
provisioning completes.

### Database trigger / migration seed

Provisioning inside a database trigger couples application business logic to the
schema layer. It was not considered further.

---

## Consequences

- Every new registration incurs four synchronous DB inserts. At current scale this
  is immaterial; if registration volume ever warrants it, the work can be moved to
  a queue with the idempotency guard already in place.
- The outer idempotency check (`Team::where('owner_id')->exists()`) is a cheap
  indexed read that short-circuits the common case. The check inside the
  transaction, protected by a row lock, is the safety guarantee against
  concurrent duplicate events.
- The `Registered` event is dispatched by the application's registration
  controller; no custom event infrastructure is required.
- Listener is registered in `AppServiceProvider` via
  `Event::listen(Registered::class, ProvisionStarterWorkspace::class)`.
- If provisioning fails after the user row has been created, the transaction
  rolls back the workspace but the user account persists. The user can log in
  but lands on an empty dashboard. A future recovery path (lazy re-provisioning
  or an explicit retry endpoint) should be added before this reaches production
  at scale.
