# Testing Strategy

## Overview

The test suite is split across backend (PHP/Pest) and frontend (TypeScript/Vitest). Backend tests are feature-level integration tests that run against a real in-memory SQLite database. Frontend tests are unit tests for pure functions and stateless components.

---

## Backend: 34 tests, 90 assertions

**Framework:** Pest 3 on top of PHPUnit. Each test class uses `RefreshDatabase` to reset state between tests. No mocking of the database layer; tests assert against actual query results.

**Run:**

```bash
docker compose exec backend php artisan test
docker compose exec backend php artisan test --parallel
```

### Test inventory

| File | Tests | What it covers |
|---|---|---|
| `AuthTest.php` | 6 | Register, login, logout, `me` endpoint, validation, duplicate email |
| `TeamTest.php` | 8 | CRUD, member add/remove, authorization boundaries (non-member blocked) |
| `ProjectTest.php` | 7 | CRUD, team-scoped access, status update, soft delete |
| `TaskTest.php` | 9 | CRUD, filters (status/priority/assignee), cursor pagination, optimistic concurrency (409 on stale version) |
| `SearchTest.php` | 2 | ILIKE match on name and description; results scoped to user's teams |
| `DashboardTest.php` | 2 | Stats aggregation, activity feed ordering |

### Key coverage points

**Authorization:** Every destructive or sensitive action is tested with both an authorized and unauthorized user. A non-team-member attempting to access a team's project returns 403, not a leaky 404.

**Optimistic concurrency:** `TaskTest` submits a PATCH with an outdated version and asserts a 409 response with no row change. Submitting with the correct version asserts the version increments and the update applies.

**Cursor pagination:** `TaskTest` creates tasks across two pages and asserts the `next_cursor` token is present on page one, then verifies the second page returns the remaining records with no overlap.

**Soft deletes:** Deleted projects and tasks are excluded from list and show endpoints. The database row is retained with `deleted_at` set.

**Cascade behaviour:** Deleting a team cascades to its projects and tasks. Removing a team member nullifies `assignee_id` on any tasks assigned to them rather than deleting those tasks.

---

## Frontend: 18 tests

**Framework:** Vitest 2 with jsdom environment and `@testing-library/react`. All tests are pure unit tests with no network calls or router context.

**Run:**

```bash
cd frontend && npm test
npm run test:watch
```

### Test inventory

| File | Tests | What it covers |
|---|---|---|
| `__tests__/utils.test.ts` | 11 | `timeAgo` (just now, minutes, hours, days), `extractApiErrors` (array values, string values, message fallback, unknown shape, picks first from array), `STATUS_LABELS` and `PRIORITY_LABELS` completeness |
| `__tests__/ActivityFeed.test.tsx` | 7 | Empty state, `task.created` render, `project.created` render, `team.member_added` with detail text, team event link routing to `/teams/:id`, task event link routing to `/projects/:id`, timestamp display |

---

## Coverage gaps

**No frontend component tests for forms:** `TaskForm`, `EditProjectModal`, and `EditTeamModal` are untested at the component level. These are integration-heavy components (controlled state, API calls, validation feedback); the appropriate tool is Playwright or Cypress, not Vitest.

**No end-to-end tests:** Browser-level flows (register, create project, assign task) are not automated. Playwright is the recommended addition.

**No queue worker tests:** Background job dispatch and processing is not covered. The queue is used only for activity log side-effects in the current implementation, reducing risk.

**No load or performance tests:** Cursor pagination and Redis caching are verified functionally but not under simulated load.

---

## Type checking

TypeScript strict mode is enabled. Run the type checker as a pre-deployment gate:

```bash
cd frontend && npx tsc --noEmit
```

This catches interface mismatches between the API response shapes and the frontend type definitions without running the full test suite.
