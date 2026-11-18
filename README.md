# Project Management Platform

A production-minded project and task management platform built with Next.js and Laravel.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (TypeScript, App Router) |
| Backend | Laravel 11 (REST API) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Auth | Laravel Sanctum (SPA cookie mode) |
| Web server | Nginx |

## Quick Start

```bash
cp .env.example .env
make build
make dev
make migrate
make seed
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Via Nginx: http://localhost:80

## Development

```bash
make logs          # tail all container logs
make shell-backend # shell into Laravel container
make test          # run all tests
make fresh         # reset and reseed database
```

## Documentation

- [Architecture](docs/architecture.md)
- [Database Design](docs/database-design.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)
- [ADRs](docs/adr/)
