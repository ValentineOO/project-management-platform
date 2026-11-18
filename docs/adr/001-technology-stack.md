# ADR-001: Technology Stack Selection

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

A new project management platform requires a frontend, an API backend, a primary
database, and a cache/queue layer. We evaluated the most credible options for each
tier against the requirements: type safety, developer productivity, proven production
characteristics at moderate scale, and an engineering team with existing PHP and
TypeScript experience.

---

## Frontend: Next.js (TypeScript, App Router)

**Chosen over:** React SPA (Vite/CRA), Vue.js, SvelteKit

Next.js was selected because:
- The App Router enables server-side rendering and static generation in the same
  codebase without a separate server. This flexibility allows different pages to
  use the rendering strategy that fits them best without reaching for additional
  infrastructure.
- Provides native TypeScript integration with built-in configuration and tooling
  support.
- The team has existing Next.js experience.

Vue.js and SvelteKit were considered but rejected: the broader Next.js ecosystem
(component libraries, authentication helpers, deployment targets) reduces integration
work. SvelteKit's smaller community would have increased the risk of hitting
unsupported edge cases.

A pure React SPA was rejected because: server rendering and routing would need to be
bolted on separately, increasing maintenance surface.

---

## Backend: Laravel 13 (PHP 8.5)

**Chosen over:** Node.js/Express, NestJS, Django/FastAPI, Go (net/http)

Laravel was selected because:
- Eloquent, migrations, policies, observers, and queues are production-proven and
  reduce the amount of infrastructure code the team needs to write and maintain.
- Sanctum SPA authentication integrates directly with the session and policy layers.
  Replicating this in Express or Gin requires assembling equivalent pieces from
  separate packages.
- Laravel's mature testing ecosystem (Pest, HTTP tests, database factories) covers
  the entire stack from unit to integration with minimal configuration.
- The team has deep Laravel experience.

NestJS was considered as a TypeScript-first alternative but rejected: a full-stack
TypeScript codebase would unify the language, but NestJS's dependency injection and
decorator-heavy architecture adds friction for teams not already familiar with it.
The benefit does not outweigh the cost given existing PHP expertise.

Go was considered for raw throughput but rejected: the standard library approach
requires building auth, ORM, and migration tooling from scratch or assembling
third-party packages with fewer guarantees than the Laravel ecosystem.

---

## Database: PostgreSQL 16

**Chosen over:** MySQL 8, MongoDB, SQLite

PostgreSQL was selected because:
- The `pg_trgm` extension provides trigram-based similarity searching with GIN/GiST
  indexes, enabling efficient fuzzy search over task titles and descriptions without
  introducing a dedicated search service (Elasticsearch, Typesense) at current scale.
- JSONB columns with indexing support flexible payload storage for activity log events
  without a schema change per new event type.
- The extension ecosystem, mature tooling, and team experience make it the lower-risk
  production choice.

MySQL was considered but rejected because PostgreSQL's extension ecosystem, particularly
`pg_trgm` for trigram-based fuzzy matching, better supports the search requirements.
MySQL offers FULLTEXT indexing for token-based search, but achieving equivalent
trigram similarity searching would require additional implementation or external
infrastructure.

MongoDB was rejected: the platform's data is relational (teams have projects, projects
have tasks, tasks have members). Modelling many-to-many relationships and enforcing
referential integrity in a document store adds complexity without benefit.

---

## Cache and Queue: Redis 7

**Chosen over:** Memcached, database-backed queues (Laravel DB driver)

Redis was selected because:
- Serves as both cache store and queue backend from a single service, avoiding an
  additional dependency.
- Provides richer native data structures (lists, sets, sorted sets, hashes), enabling
  more sophisticated caching and queueing patterns than Memcached's plain key-value
  store.
- Laravel's Redis driver supports atomic operations, which the cache invalidation
  pattern in `DashboardService` relies on.
- Session storage in Redis (`SESSION_DRIVER=redis`) enables stateless application
  servers for horizontal scaling.

Memcached was rejected: no pub/sub, cannot serve as a queue backend. Using it
alongside a separate queue driver would add an unnecessary second service.

The database queue driver was rejected for production: polling the database for queue
jobs adds load to the primary write path and increases latency for background jobs.
Redis-backed workers can consume jobs with low latency without repeatedly querying
the primary relational database. Queue durability depends on Redis persistence
configuration (RDB snapshots or AOF); the current deployment uses AOF for recovery.

---

## Validation

- Application dependency versions verified against `composer.lock` and
  `package-lock.json`.
- PostgreSQL and Redis server versions verified against running service configuration,
  not lockfiles (lockfiles track PHP and Node packages only).
- Security posture validated via `composer audit` (zero known vulnerabilities at time
  of writing) and `npm audit` for the frontend.
- Performance characteristics validated via EXPLAIN ANALYZE (see ADR-006 and
  `storage/explain-analyze.txt`).
