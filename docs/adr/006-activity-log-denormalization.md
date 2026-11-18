# ADR-006: Denormalizing project_id onto activity_logs

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

The dashboard endpoint shows the 10 most recent activity events across all projects
the authenticated user belongs to. `activity_logs` records events on tasks
(`subject_type`, `subject_id`). The initial schema had no direct `project_id` column.

The initial implementation queried recent activity by joining
`activity_logs` to `tasks` to reach `project_id`. EXPLAIN ANALYZE on 90,000 activity
log rows showed:

```
Nested Loop (actual time=22.9ms)
  Index Scan Backward on activity_logs using created_at index
    scanned 1,302 rows to find 10 matching a given project
  Memoize on tasks_pkey
    1,269 cache misses
```

The root cause: sorting by `created_at` and filtering by `project_id` requires
crossing the `tasks` table on every row. No index on `activity_logs` can satisfy
both predicates because `project_id` did not exist on the table.

---

## Decision

Add a denormalized `project_id` column to `activity_logs` with a composite index
`(project_id, created_at)`.

This deliberately violates 3NF: `project_id` is derivable from `tasks.project_id`
via `subject_id`. The violation is accepted because the read path is a hot path
(dashboard, cached but frequently invalidated on active teams) and the write path
is fully controlled through `TaskObserver`.

---

## Alternatives Considered

### Materialised view over activity_logs JOIN tasks (rejected)

Rejected because: materialised view refresh is either manual (stale reads) or
trigger-based (write amplification on every task change). Adds infrastructure
complexity for a problem that a single column solves.

### Time-series store / event log service (rejected)

Rejected because: appropriate at millions of events per day. At current scale this
is the wrong tool. The problem is a missing index, not a missing infrastructure tier.

### Accept 23ms and rely on Redis cache alone (not sufficient)

The dashboard is Redis-cached for 300 seconds, so 23ms only fires on a cold cache.
However, cache invalidation fires on every task write. Teams with high write frequency
will have frequent cold cache misses. The denormalization eliminates the problem
rather than masking it.

---

## Consequences

**Positive:**
- Activity log query drops from 23ms to 0.048ms under benchmark conditions (480x
  improvement). These figures are specific to the test environment with 90,000 rows;
  actual production performance will vary with dataset distribution, database
  configuration, and cache state.
- EXPLAIN ANALYZE confirms: `Index Scan Backward using activity_logs_project_id_created_at_index`,
  9 buffer hits, no joins.

**Negative:**
- `project_id` on `activity_logs` must stay consistent with `tasks.project_id`.
  Tasks currently cannot move between projects. If that feature is ever added, a
  backfill migration will be required.
- Schema is intentionally not in 3NF. Documented here so future engineers
  understand the tradeoff rather than treating it as an oversight.
- Consistency depends on controlling write paths. Any part of the application that
  updates tasks using bulk query builder operations (e.g. `Task::where(...)->update(...)`)
  will bypass `TaskObserver` and must create activity logs and populate `project_id`
  explicitly. This constraint should be documented and enforced at code review.

---

## Implementation Notes

Migration: `2026_11_18_070733_add_project_id_to_activity_logs_table`

`TaskObserver` populates `project_id` from `$task->project_id` on `created`,
`updated`, and `deleted` events. For soft deletes, the Task model still holds all
attributes when the observer fires (deleted_at is set but the model is fully loaded),
so `project_id` is reliably available.

For production databases with existing activity logs, a one-time backfill is needed.
This backfill only covers logs whose associated tasks still exist. If tasks were
hard-deleted before this migration, their historical activity logs will have NULL
`project_id` and will not appear in project-scoped dashboard queries. The dashboard
query must account for this possibility when it arises.

```sql
UPDATE activity_logs al
SET project_id = t.project_id
FROM tasks t
WHERE al.subject_type = 'App\Models\Task'
  AND al.subject_id = t.id
  AND al.project_id IS NULL;
```

The column is `nullable` to handle any logs written before the migration or through
paths that do not go through `TaskObserver`.

The backfill assumes `subject_type` stores the fully qualified model class
(`App\Models\Task`). Laravel supports polymorphic type aliases through morph maps
(`Relation::enforceMorphMap`). If morph maps are introduced later, `subject_type`
could be stored as a short alias (e.g. `task`) rather than the class name, and the
backfill SQL must use the value that is actually stored in the column. Verify the
configured morph type before running the backfill in any environment.

---

## Reconsideration Triggers

- Tasks become movable between projects (requires backfill on every move).
- Activity logging expands to non-task subjects that do not have a natural
  `project_id` relationship.

---

## Validation

- EXPLAIN ANALYZE: before (23ms, nested loop) and after (0.048ms, index scan)
  documented in `storage/explain-analyze.txt`
- Consistency check: after any task write, verify `activity_logs.project_id`
  matches `tasks.project_id` for all rows with `subject_type = Task`
