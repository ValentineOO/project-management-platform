# API Overview

Base URL: `/api`
Auth: Laravel Sanctum SPA cookie mode. All protected routes require a valid session cookie obtained via the auth flow below.
Content-Type: `application/json`

---

## Authentication

Before any authenticated request, fetch a CSRF token:

```
GET /sanctum/csrf-cookie
```

Sets the `XSRF-TOKEN` cookie. Include it as the `X-XSRF-TOKEN` header on all subsequent mutating requests (POST, PATCH, DELETE).

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create account; auto-creates a starter team |
| `POST` | `/api/auth/login` | No | Authenticate; sets session cookie |
| `POST` | `/api/auth/logout` | Yes | Invalidate session |
| `GET` | `/api/auth/me` | Yes | Return authenticated user object |

**Register / Login request body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

**Response:** `200 { "user": { "id", "name", "email", "created_at" } }`

---

## Teams

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/teams` | Yes | List teams the authenticated user belongs to |
| `POST` | `/api/teams` | Yes | Create a team |
| `GET` | `/api/teams/{team}` | Yes | Get team with members |
| `PATCH` | `/api/teams/{team}` | Yes | Update team (owner only) |
| `DELETE` | `/api/teams/{team}` | Yes | Delete team (owner only) |
| `POST` | `/api/teams/{team}/members` | Yes | Add member by name + email |
| `DELETE` | `/api/teams/{team}/members/{user}` | Yes | Remove member (owner/admin only) |

**Store / Update body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Add member body:**

```json
{
  "name": "string",
  "email": "string"
}
```

If the email does not exist, a new account is created with the email as a temporary password. The user must change their password on first login.

---

## Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/teams/{team}/projects` | Yes | List projects for a team (cursor-paginated) |
| `POST` | `/api/teams/{team}/projects` | Yes | Create project within a team |
| `GET` | `/api/projects/{project}` | Yes | Get project with stats and member list |
| `PATCH` | `/api/projects/{project}` | Yes | Update project |
| `DELETE` | `/api/projects/{project}` | Yes | Soft-delete project (manager only) |

**Store body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Update body** (all fields optional):

```json
{
  "name": "string",
  "description": "string",
  "status": "active | archived | completed",
  "team_id": "integer"
}
```

**Show response:**

```json
{
  "project": { "id", "name", "description", "status", "team_id", "owner_id", "team": {} },
  "members": [{ "id", "name" }],
  "task_stats": { "todo": 0, "in_progress": 0, "in_review": 0, "done": 0 }
}
```

---

## Tasks

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects/{project}/tasks` | Yes | List tasks (cursor-paginated, filterable) |
| `POST` | `/api/projects/{project}/tasks` | Yes | Create task |
| `GET` | `/api/tasks/{task}` | Yes | Get single task |
| `PATCH` | `/api/tasks/{task}` | Yes | Update task (version required) |
| `DELETE` | `/api/tasks/{task}` | Yes | Soft-delete task |

**List query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `cursor` | string | Opaque cursor from previous response |
| `status` | string | Filter: `todo`, `in_progress`, `in_review`, `done` |
| `assignee_id` | integer | Filter by assignee user ID |
| `priority` | string | Filter: `low`, `medium`, `high`, `urgent` |

**Store body:**

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "todo | in_progress | in_review | done",
  "priority": "low | medium | high | urgent",
  "assignee_id": "integer | null",
  "due_date": "YYYY-MM-DD | null"
}
```

**Update body** (version is mandatory; all task fields are optional):

```json
{
  "version": 3,
  "title": "string",
  "status": "done",
  "priority": "high"
}
```

The version must match the current row version. If another client updated the task concurrently, the server returns `409` and the client must re-fetch before retrying.

---

## Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Yes | Aggregated stats and recent activity |

**Response:**

```json
{
  "stats": {
    "total_projects": 0,
    "total_tasks": 0,
    "tasks_by_status": {},
    "overdue_tasks": 0
  },
  "recent_activity": [
    {
      "id": 1,
      "action": "task.created",
      "subject_type": "App\\Models\\Task",
      "subject_id": 42,
      "project_id": 7,
      "payload": {},
      "causer": { "id", "name" },
      "created_at": "ISO8601"
    }
  ]
}
```

Stats are cached per user in Redis (5-minute TTL). Cache is invalidated on task create, update, and delete.

---

## Search

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search` | Yes | Search projects and tasks across user's teams |

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search term (min 2 chars, max 100) |
| `type` | string | No | `projects`, `tasks`, or `all` (default) |

Search uses PostgreSQL `ILIKE` on name/title and description fields. Results are scoped to teams the authenticated user belongs to. Returns up to 10 results per resource type.

---

## Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/profile` | Yes | Update display name |
| `POST` | `/api/profile/password` | Yes | Change password |

**Update profile body:**

```json
{ "name": "string (required)" }
```

**Change password body:**

```json
{
  "current_password": "string",
  "password": "string (min 8 chars)",
  "password_confirmation": "string"
}
```

---

## Pagination

Task and project list endpoints use cursor-based pagination.

**Response envelope:**

```json
{
  "data": [],
  "next_cursor": "opaque string | null",
  "prev_cursor": "opaque string | null"
}
```

Pass `cursor=<next_cursor>` to fetch the next page. A null `next_cursor` means no further pages exist. Cursor values are opaque and must not be constructed manually.

Offset-based pagination (`page`, `per_page`) is not supported. See [ADR 003](../adr/003-cursor-pagination.md) for rationale.

---

## Error responses

| Status | Meaning |
|---|---|
| `401` | Unauthenticated; session missing or expired |
| `403` | Authorised but not permitted to perform this action on this resource |
| `404` | Resource not found or not visible to this user |
| `409` | Optimistic concurrency conflict; re-fetch the resource and retry |
| `422` | Validation failure; body contains `{ "errors": { "field": ["message"] } }` |
| `500` | Internal server error |

**Validation error shape:**

```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."],
    "version": ["The version field is required."]
  }
}
```

---

## Health

```
GET /api/health
```

Returns `200 { "status": "ok" }`. Used by Kubernetes readiness and liveness probes. No authentication required.
