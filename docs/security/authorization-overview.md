# Security and Authorization

## Authentication mechanism

The API uses Laravel Sanctum in SPA mode: session-based authentication with an HTTP-only cookie. No tokens are stored in localStorage or sessionStorage.

**Auth flow:**

1. `GET /sanctum/csrf-cookie` sets the `XSRF-TOKEN` cookie (readable by JavaScript).
2. `POST /api/auth/login` with `X-XSRF-TOKEN` header validates credentials and sets an HTTP-only `laravel_session` cookie.
3. All subsequent requests include the session cookie automatically via the browser; the `X-XSRF-TOKEN` header is required on mutating requests (POST, PATCH, DELETE).

Sessions are stored in Redis. Session lifetime and cookie settings (`SameSite`, `Secure`, `HttpOnly`) are configured via the standard Laravel session config.

---

## Authorization model

Authorization is enforced through Laravel Policies registered against Eloquent models. All policy checks are explicit; there is no default-allow fallback.

| Policy | Model | Registered in |
|---|---|---|
| `TeamPolicy` | `Team` | `AuthServiceProvider` |
| `ProjectPolicy` | `Project` | `AuthServiceProvider` |
| `TaskPolicy` | `Task` | `AuthServiceProvider` |

Controllers call `$this->authorize()` before every operation. An unauthorized request returns `403 Forbidden`.

---

## Permission matrix

### Teams

| Action | Required role |
|---|---|
| View team | Any team member |
| Create team | Authenticated user |
| Update team | Team owner |
| Delete team | Team owner |
| Add member | Team owner or admin |
| Remove member | Team owner or admin |

### Projects

| Action | Required role |
|---|---|
| List projects | Any member of the parent team |
| Create project | Any member of the parent team |
| View project | Any member of the parent team |
| Update project | Project manager |
| Delete project | Project manager |

### Tasks

| Action | Required role |
|---|---|
| List tasks | Any member of the parent project's team |
| Create task | Any member of the parent project's team |
| View task | Any member of the parent project's team |
| Update task | Task reporter or project manager |
| Delete task | Task reporter or project manager |

---

## Access boundaries

**Team scope:** A user can only see teams they explicitly belong to. The `TeamController::index` queries through the `team_members` pivot, not the full `teams` table.

**Project scope:** Projects are accessed only through their parent team. A project is not reachable via its direct ID (`/api/projects/{id}`) unless the authenticated user is a member of the project's team. The `ProjectPolicy::view` check enforces this.

**Task scope:** Tasks are scoped to their parent project. `TaskPolicy` checks team membership via the project relationship before any read or write.

**Search scope:** The `SearchController` restricts `ILIKE` queries to `project_ids` derived from the authenticated user's team IDs. Users cannot search content belonging to teams they are not members of.

---

## Input validation

All request payloads are validated via Laravel Form Requests or inline `$request->validate()` calls before any database operation. Validation failures return `422 Unprocessable Entity` with field-level error messages.

Validation rules reject:

- Empty or oversized strings (name fields capped at 255 chars)
- Invalid enum values (status, priority, role)
- Referencing resources that do not exist (`exists:teams,id` constraints on FKs)
- Password confirmation mismatch
- Current password incorrectness on password change

---

## Password handling

Passwords are hashed using bcrypt via Laravel's `Hash::make()`. Plaintext passwords are never stored or logged.

New accounts created via the "Add Member" flow (where a team owner adds someone who does not yet have an account) are created with the email address as a temporary plaintext password. This is a known limitation documented in the [README](../../README.md#known-limitations). The user is expected to change their password on first login.

---

## Soft deletes and data isolation

Projects and tasks use `SoftDeletes`. Deleted records are excluded from all queries via the global scope applied by Laravel's `SoftDeletes` trait. Deleted resources cannot be accessed, updated, or referenced by authenticated users through the API.

---

## Known gaps

- **No rate limiting**: login and registration endpoints are not rate-limited. Would add via Laravel's `throttle` middleware before any public deployment.
- **No password reset flow**: users who forget their password have no self-service recovery path.
- **No email verification**: accounts are active immediately on registration.
- **Temporary plaintext passwords**: the "add member" flow creates accounts with a guessable password. Acceptable for a closed internal tool; not acceptable for a public-facing deployment.
