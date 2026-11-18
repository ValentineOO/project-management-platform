# ADR-004: Optimistic Concurrency Control over Pessimistic Locking

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

Multiple users on the same team can edit the same task simultaneously. Without
concurrency control, a later write silently overwrites an earlier one: the lost
update problem.

Two strategies exist: pessimistic locking (lock the row on read, release on write)
and optimistic concurrency (detect conflict at write time using a version counter).

Task edits are low-contention: two users editing the exact same task at the exact
same second is rare. The read-to-write window is short (seconds, not minutes).
Holding database locks for the duration of user think time would exhaust the
connection pool under any real concurrency.

---

## Assumptions

Task editing is relatively low-contention. If the platform evolves into a
real-time collaborative editor with many simultaneous writers per task, the
retry-on-409 model may produce unacceptable UX and this decision should be
revisited in favour of operational transformation or CRDT-based approaches.

---

## Decision

Use optimistic concurrency control via a `version` integer column on `tasks`.

- On read, the client receives the current `version`.
- On write (`PATCH /tasks/{task}`), the client sends the `version` it last saw.
- The server issues an atomic conditional UPDATE:
  `UPDATE tasks SET ... version = version + 1 WHERE id = ? AND version = ?`
- If `affected rows = 0`, another write happened between the client's read and
  write. The server returns `409 Conflict`.
- The client reloads the latest state and re-applies their change.

The SQL UPDATE itself is the conflict check. No explicit `SELECT FOR UPDATE` is
needed. The database atomically verifies and writes in a single operation.

---

## Alternatives Considered

### Pessimistic locking (rejected)

`SELECT ... FOR UPDATE` on read, hold the lock until the user submits.

Rejected because: lock duration is proportional to user think time, potentially
minutes. Under any real concurrency this saturates the connection pool. A single
slow client blocks all other writers on the same task.

### Last-write-wins (rejected)

No concurrency control. The most recent write always wins.

Rejected because: silently loses data with no indication to the user.
Unacceptable for a tool where task descriptions carry planning context.

---

## Consequences

**Positive:**
- No lock contention under normal use. Reads are always non-blocking.
- Conflict is rare in practice. Most writes succeed on the first attempt.
- Simple to test: seed a task at version 2, send version 1, assert 409.

**Negative:**
- Requires the client to handle 409 responses and implement a retry/merge UI.
- Under pathological contention (many users hammering the same task rapidly)
  retry loops could increase perceived latency. Not a realistic scenario under
  the current assumption.

---

## Implementation

The task update and activity log creation are wrapped in a single transaction,
so both succeed or both roll back atomically:

```php
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

    ActivityLog::create([...]);

    return $task->fresh();
});
```

A query builder update bypasses the Eloquent observer, so `ActivityLog` is created
explicitly inside the transaction rather than through `TaskObserver`. Creates and
deletes still go through the observer since those use Eloquent model operations.

`affected = 0` most commonly means the submitted version is stale. However, a
concurrent soft delete between the initial fetch and the UPDATE also produces zero
affected rows, because of the `whereNull('deleted_at')` condition. In that scenario
the application returns 409, which is not technically wrong (the update did not
succeed), but conflates a deleted resource with a version conflict. If the product
requires the client to distinguish these cases, a follow-up read after zero rows can
determine whether the task was deleted; for the current use cases this distinction
is not needed.

---

## Reconsideration Triggers

- Conflict rates become consistently high under normal team usage.
- The product adds real-time collaborative editing within a single task.

---

## Validation

- Unit test: seed task at version 2, PATCH with version 1, assert 409
- Unit test: seed task at version 1, PATCH with version 1, assert 200 and version 2
- Concurrency test: two simultaneous PATCHes with the same version; exactly one
  returns 200 and one returns 409 (requires genuinely concurrent requests, not
  two sequential ones)
