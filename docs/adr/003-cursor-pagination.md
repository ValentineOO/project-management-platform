# ADR-003: Cursor-based Pagination over OFFSET

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

The tasks list endpoint (`GET /api/projects/{project}/tasks`) must remain fast as
projects accumulate thousands of tasks. The two standard pagination strategies are
OFFSET/LIMIT and cursor-based (keyset) pagination.

At 50,000 tasks, `OFFSET 10000 LIMIT 20` requires the database to scan and discard
10,000 rows before returning 20. This cost is linear in the offset value and grows
with every page deeper into the list.

---

## Decision

Use cursor-based pagination for the platform's primary list endpoints (task feeds,
activity feeds) where sequential navigation is the dominant consumption pattern.
OFFSET pagination remains appropriate for smaller administrative tables that require
arbitrary page navigation, provided the dataset stays within acceptable size limits.

For the tasks list, Laravel's `cursorPaginate()`
encodes the last-seen `(created_at, id)` pair into an opaque cursor. Each subsequent
page is a range scan (`WHERE (created_at, id) < (?, ?)`) rather than a full skip.

`id` is included as a secondary sort key to guarantee uniqueness. `created_at` alone
is not sufficient because multiple tasks can share the same timestamp, which produces
non-deterministic ordering and breaks cursor stability.

---

## Alternatives Considered

### OFFSET/LIMIT (rejected)

Simple to implement and familiar to API consumers.

Rejected because: performance degrades linearly with page depth. At page 500 of a
50k-task project, PostgreSQL must scan and discard 10,000 rows per request. Also
unstable under concurrent inserts: rows shift between pages, causing duplicates or
gaps in a user's feed.

### Page-number pagination with count cache (rejected)

Cache total row count, use OFFSET internally, expose page numbers externally.

Rejected because: still O(offset) at the database layer. The count cache adds write
complexity and becomes stale under concurrent writes.

---

## Consequences

**Positive:**
- Each page is O(log N + k) where N is the index size and k is the page size,
  regardless of how deep into the list the cursor is.
- Resistant to pagination shifts caused by concurrent inserts, provided ordering
  columns (`created_at`, `id`) remain immutable. No snapshot consistency is
  guaranteed across separate requests.
- Natural fit for infinite-scroll UIs, which is the primary consumption pattern
  for task lists.

**Negative:**
- Cannot jump to an arbitrary page number. Acceptable because task lists are
  consumed as feeds, not random-access indexes.
- API consumers must store and forward the opaque cursor token.

---

## Implementation

```php
$tasks = $project->tasks()
    ->orderByDesc('created_at')
    ->orderByDesc('id')
    ->cursorPaginate(20);
```

Newest tasks appear first (descending order). The composite index `(project_id,
created_at, id)` on `tasks` supports the full ordering predicate. Including `id`
in the index allows the planner to satisfy `ORDER BY created_at DESC, id DESC`
without a separate sort step.

EXPLAIN ANALYZE at 50,000 rows confirms: `Index Scan using tasks_project_cursor_index`,
execution time 0.2ms.

---

## Validation

- EXPLAIN ANALYZE: confirms index scan (not seq scan) at 50k rows
- Stability test: insert a task between two page fetches and verify that existing
  records already returned do not reappear on subsequent pages (cursor boundary
  integrity); newly inserted records sorting ahead of the cursor are expected to
  be absent from subsequent pages, which is correct behaviour
- Performance regression: re-run EXPLAIN ANALYZE at 500k rows; execution time
  should remain sub-millisecond
