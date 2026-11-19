# Entity Relationship Diagram

Generated from Laravel migrations in `backend/database/migrations/`.

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        string password
        timestamp email_verified_at
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    teams {
        bigint id PK
        bigint owner_id FK
        string name
        string slug UK
        text description
        timestamp created_at
        timestamp updated_at
    }

    team_members {
        bigint team_id FK
        bigint user_id FK
        string role
        timestamp joined_at
    }

    projects {
        bigint id PK
        bigint team_id FK
        bigint owner_id FK
        string name
        text description
        string status
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        bigint project_id FK
        bigint user_id FK
        string role
        timestamp joined_at
    }

    tasks {
        bigint id PK
        bigint project_id FK
        bigint assignee_id FK
        bigint reporter_id FK
        string title
        text description
        string status
        string priority
        date due_date
        int version
        timestamp created_at
        timestamp updated_at
    }

    activity_logs {
        bigint id PK
        bigint causer_id FK
        bigint project_id FK
        string subject_type
        bigint subject_id
        string action
        json payload
        timestamp created_at
    }

    users ||--o{ teams : "owns"
    users ||--o{ team_members : "member"
    teams ||--o{ team_members : "has members"
    teams ||--o{ projects : "has projects"
    users ||--o{ projects : "owns"
    projects ||--o{ project_members : "has members"
    users ||--o{ project_members : "member of"
    projects ||--o{ tasks : "has tasks"
    users ||--o{ tasks : "assignee"
    users ||--o{ tasks : "reporter"
    users ||--o{ activity_logs : "causes"
    projects ||--o{ activity_logs : "logged against"
```

## Enum values

| Table | Column | Allowed values |
|---|---|---|
| `team_members` | `role` | `owner`, `admin`, `member` |
| `project_members` | `role` | `manager`, `member`, `viewer` |
| `projects` | `status` | `active`, `archived`, `completed` |
| `tasks` | `status` | `todo`, `in_progress`, `in_review`, `done` |
| `tasks` | `priority` | `low`, `medium`, `high`, `urgent` |

## Design notes

- **`team_members`**: composite unique on `(team_id, user_id)`; `role` controls permissions within the team
- **`project_members`**: composite unique on `(project_id, user_id)`; project access is scoped to team membership, not direct invite
- **`tasks.version`**: used for optimistic concurrency. `UPDATE` only succeeds when `WHERE id = ? AND version = ?`, then atomically increments. Returns 409 on mismatch. See [ADR 004](../adr/004-optimistic-concurrency.md)
- **`tasks.assignee_id`**: nullable with `nullOnDelete`; reassigned to null if the user is removed rather than cascading a delete
- **`activity_logs`**: polymorphic subject via `subject_type` + `subject_id` covers teams, projects, and tasks from a single append-only table. See [ADR 006](../adr/006-activity-log-denormalization.md)
- **`activity_logs.project_id`**: denormalised FK enabling fast per-project feed queries without a join through `subject_type`
