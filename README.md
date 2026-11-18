# Project Management Platform

A production-minded project and task management platform built with Next.js and Laravel.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (TypeScript, App Router, React 19) |
| Backend | Laravel 13 (PHP 8.5, REST API) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Auth | Laravel Sanctum (SPA cookie mode) |
| Web server | Nginx |

## Quick Start

```bash
# 1. Copy environment file
cp backend/.env.example backend/.env
# Edit backend/.env — set APP_KEY, DB_PASSWORD, etc.

# 2. Build and start all containers
docker compose up -d --build

# 3. Run database migrations
docker compose exec backend php artisan migrate

# 4. (Optional) Seed demo data
docker compose exec backend php artisan db:seed
```

| URL | Service |
|---|---|
| http://localhost:3000 | Frontend (Next.js) |
| http://localhost:8000 | Backend API (Laravel) |
| http://localhost:8082 | App via Nginx reverse proxy |

## Development

```bash
# Tail all container logs
docker compose logs -f

# Shell into the backend container
docker compose exec backend bash

# Run the backend test suite
docker compose exec backend php artisan test

# Reset and reseed the database
docker compose exec backend php artisan migrate:fresh --seed
```

## Tests

```bash
# Backend feature + unit tests (Pest)
docker compose exec backend php artisan test --parallel

# Frontend type-check
docker compose exec frontend npx tsc --noEmit
```

## Documentation

- [ADRs](docs/adr/) — major engineering decisions
- [Kubernetes](infrastructure/k8s/) — deployment manifests
