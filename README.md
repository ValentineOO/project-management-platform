# Project Management Platform

A production-ready project and task management platform for growing engineering organizations. Teams create projects, assign and track tasks, monitor progress through a live dashboard, and collaborate across multiple teams, backed by a secure, scalable API.

Built with an emphasis on data integrity (optimistic concurrency), operational simplicity (single Docker Compose command), and production readiness (Kubernetes manifests, health probes, horizontal autoscaling).

---

## Stack

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Laravel](https://img.shields.io/badge/Laravel_13-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.5-777BB4?style=flat-square&logo=php&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Local Development](#local-development)
  - [Prerequisites](#prerequisites)
  - [First Run](#first-run)
  - [Common Commands](#common-commands)
- [Running Tests](#running-tests)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Architecture Decisions](#architecture-decisions)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)

---

## Features

- **Teams and Projects**: create teams, invite members by name and email, organize projects per team
- **Task management**: full lifecycle with status, priority, due dates, and assignees
- **Optimistic concurrency**: version-based conflict detection prevents silent data loss under concurrent edits
- **Live dashboard**: stats and a full activity feed covering all create/update/delete events across projects and teams
- **Search**: cross-resource search scoped to the authenticated user's teams
- **Cursor pagination**: stable under concurrent inserts, no offset drift at scale
- **Authorization**: resource-scoped policies (team owner, project manager, task reporter)
- **Profile management**: users can update their display name and change their password

---

## Local Development

### Prerequisites

- Docker + Docker Compose v2
- Make _(optional; wraps common commands)_

### First Run

```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env
# Set at minimum: DB_DATABASE, DB_USERNAME, DB_PASSWORD
# Generate APP_KEY:
docker compose run --rm backend php artisan key:generate --show
# Paste the output into backend/.env as APP_KEY=

# 2. Build images and start all services
docker compose up -d --build
# or: make up

# 3. Run migrations
docker compose exec backend php artisan migrate
# or: make migrate

# 4. (Optional) Seed demo data
docker compose exec backend php artisan db:seed
```

| URL | Service |
|---|---|
| http://localhost:3000 | Frontend (Next.js dev server with HMR) |
| http://localhost:8000 | Backend API |
| http://localhost:8082 | App via Nginx reverse proxy |
| `localhost:5433` | PostgreSQL (host-mapped) |
| `localhost:6380` | Redis (host-mapped) |

> **Data persistence:** PostgreSQL data lives in the `postgres_data` named Docker volume.
> It survives `docker compose down` and `docker compose stop`.
> It is **destroyed** by `docker compose down -v`. Only use that flag when you want a clean slate.

### Common Commands

```bash
make up              # Start all containers
make down            # Stop containers (data preserved)
make logs            # Tail all container logs
make migrate         # Run pending migrations

# Manual equivalents
docker compose exec backend bash                              # Shell into backend
docker compose exec backend php artisan migrate:fresh --seed  # Hard reset + reseed
```

---

## Running Tests

### Backend: 34 tests, 90 assertions

```bash
docker compose exec backend php artisan test

# Run in parallel
docker compose exec backend php artisan test --parallel
```

Covers auth, teams, projects, tasks (CRUD, filters, cursor pagination, optimistic concurrency), search, and activity logging.

### Frontend: 18 tests

```bash
cd frontend && npm test

# Watch mode
npm run test:watch
```

Covers utility functions (`timeAgo`, `extractApiErrors`, label maps) and the `ActivityFeed` component (all event types, routing, timestamps).

### Type checking

```bash
cd frontend && npx tsc --noEmit
```

---

## Kubernetes Deployment

Manifests live in [`infrastructure/k8s/`](infrastructure/k8s/). The stack assumes **externally managed** PostgreSQL and Redis (e.g. AWS RDS + ElastiCache). There are no in-cluster database deployments.

### Prerequisites

- A Kubernetes cluster with an Nginx ingress controller
- External PostgreSQL 16 and Redis 7 instances
- Container images built and pushed to a registry (handled by CI/CD)

### Deploy Order

```bash
# 1. Namespace
kubectl apply -f infrastructure/k8s/00-namespace.yaml

# 2. Config and secrets: fill in all REPLACE_WITH_* values first
kubectl apply -f infrastructure/k8s/01-configmap.yaml
kubectl apply -f infrastructure/k8s/02-secret.yaml

# 3. Run migrations
kubectl delete job db-migrate -n codefyve --ignore-not-found
kubectl apply -f infrastructure/k8s/09-migration-job.yaml
kubectl wait --for=condition=complete job/db-migrate -n codefyve --timeout=120s

# 4. Deploy services
kubectl apply -f infrastructure/k8s/03-backend-deployment.yaml
kubectl apply -f infrastructure/k8s/04-backend-service.yaml
kubectl apply -f infrastructure/k8s/05-frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/06-frontend-service.yaml
kubectl apply -f infrastructure/k8s/07-worker-deployment.yaml

# 5. Ingress and autoscaling
kubectl apply -f infrastructure/k8s/08-ingress.yaml
kubectl apply -f infrastructure/k8s/10-hpa.yaml
```

### Configuration Reference

| File | Purpose |
|---|---|
| `01-configmap.yaml` | Non-secret runtime config (app name, log level, cache/queue drivers) |
| `02-secret.yaml` | Credentials: DB, Redis, APP_KEY, Sanctum domains |
| `08-ingress.yaml` | Replace `REPLACE_WITH_YOUR_DOMAIN`; uncomment TLS block when cert-manager is available |
| `10-hpa.yaml` | Scales backend 2 to 8 replicas on CPU >= 70% or memory >= 80% |

> **`NEXT_PUBLIC_API_URL`** must be a Docker **build argument**, not a runtime env var.
> Next.js bakes `NEXT_PUBLIC_*` into the client bundle at build time.
> Pass it in CI: `docker build --build-arg NEXT_PUBLIC_API_URL=https://your-domain ...`

---

## Architecture Decisions

Seven ADRs are recorded in [`docs/adr/`](docs/adr/):

| # | Decision | Rationale |
|---|---|---|
| [001](docs/adr/001-technology-stack.md) | Next.js + Laravel | Type-safe SPA with a mature opinionated API framework |
| [002](docs/adr/002-modular-monolith.md) | Modular monolith | Lower operational overhead at current scale vs microservices |
| [003](docs/adr/003-cursor-pagination.md) | Cursor pagination for tasks | Stable under concurrent inserts; no offset drift |
| [004](docs/adr/004-optimistic-concurrency.md) | Version field + 409 | Prevents silent last-write-wins data loss under concurrent edits |
| [005](docs/adr/005-sanctum-spa-auth.md) | Sanctum SPA cookie auth | CSRF-protected, no token storage in JS, same-origin session |
| [006](docs/adr/006-activity-log-denormalization.md) | Denormalised activity log | Append-only, cheap reads, no joins required for the feed |
| [007](docs/adr/007-onboarding-starter-workspace.md) | Auto-create workspace on register | Zero-friction first login; user lands on a working dashboard |

---

## Documentation

| Document | Description |
|---|---|
| [ERD](docs/architecture/erd.md) | Entity relationship diagram with key design notes |
| [Data Flow Diagram](docs/architecture/data-flow-diagram.md) | Request flow, auth sequence, optimistic concurrency, activity logging |
| [API Overview](docs/api/api-overview.md) | Endpoints, payloads, auth requirements, pagination, error codes |
| [Testing Strategy](docs/testing/testing-strategy.md) | Test inventory, coverage rationale, known gaps |
| [Security and Authorization](docs/security/authorization-overview.md) | Auth mechanism, policies, access boundaries, session handling |
| [Deployment Guide](docs/infrastructure/deployment-guide.md) | Local setup, K8s deploy sequence, env vars, troubleshooting |
| [ADRs](docs/adr/) | Seven architecture decision records |

---

## Project Structure

```
.
├── backend/                   Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Observers/         # Activity logging (ProjectObserver)
│   │   ├── Policies/          # Authorization (ProjectPolicy, TaskPolicy, TeamPolicy)
│   │   └── Services/          # DashboardService (cached stats)
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   └── tests/Feature/         # 34 feature tests
├── frontend/                  Next.js 16
│   ├── app/(app)/             # Authenticated routes (dashboard, projects, teams, profile)
│   ├── components/            # shadcn/ui base + domain components
│   ├── hooks/                 # Data-fetching hooks with module-level cache
│   ├── services/              # Typed API client functions
│   └── __tests__/             # 18 Vitest unit tests
├── infrastructure/
│   ├── docker/                # Nginx config
│   └── k8s/                   # 11 Kubernetes manifests (namespace to HPA)
└── docs/
    ├── adr/                   # Architecture Decision Records
    ├── api/
    ├── architecture/
    ├── testing/
    ├── security/
    └── infrastructure/
```

---

## Known Limitations

- **No password reset flow**: users who forget their password require manual intervention. Addressable via Laravel's built-in password broker and a mail driver.
- **No email verification**: accounts are active immediately on registration. Required before any public-facing deployment.
- **In-cluster databases not provided**: K8s manifests assume externally managed PostgreSQL and Redis. Not suitable for a standalone cluster demo without provisioning those services separately.
- **Frontend test coverage is shallow**: unit tests cover utility functions and the activity feed component. Full integration coverage would use Playwright or Cypress.
- **Memory-based HPA** requires a custom metrics provider. The CPU target in `10-hpa.yaml` works out of the box; the memory target may need a metrics adapter depending on the cluster.
