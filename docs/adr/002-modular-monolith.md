# ADR-002: Modular Monolith over Microservices

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

The platform needs to support teams, projects, tasks, search, and an activity feed.
The initial engineering team is small (1-3 engineers). We need to ship a working,
maintainable system without sacrificing the ability to extract services later if
traffic demands it.

Microservices are frequently proposed as the default for production systems, but
distributing a system before it needs distribution introduces network latency between
calls that were previously in-process, operational overhead (service discovery, health
checks, independent deployments), and distributed transaction complexity that a small
team cannot absorb productively.

---

## Decision

Build a modular monolith: a single deployable Laravel application with internal
domain boundaries enforced by namespace and directory structure, not by network calls.

The target module structure is domain-oriented:

```
app/
├── Modules/
│   ├── Teams/
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   └── Policies/
│   ├── Projects/
│   ├── Tasks/
│   └── Activity/
```

The current implementation uses a flatter structure as a starting point. Migrating
to full domain modules is a planned iteration once the domain boundaries stabilise.

---

## Alternatives Considered

### Microservices (rejected)

Each domain as a separate service with its own database.

Rejected because: cross-domain queries (dashboard stats joining teams, projects,
and tasks) would become distributed calls with latency and consistency tradeoffs.
Requires service discovery, independent deployments, and duplicated auth logic from
day one. The engineering cost is not justified before we have a measured scaling
problem.

### Serverless functions (rejected)

One function per endpoint.

Rejected because: cold starts conflict with sub-100ms p99 targets. Stateful concerns
(sessions, queues, Redis) become significantly harder to reason about.

---

## Consequences

**Positive:**
- Single deployment unit.
- Cross-domain queries are in-process and transactional.
- Module boundaries can be refactored without protocol versioning.
- Individual domains can be extracted into independent services later, provided
  their internal dependencies are properly isolated and their public interfaces
  are well-defined. Extraction readiness depends on the domain boundaries being
  stabilised and enforced, which is a planned iteration.

**Negative:**
- All modules share a database schema. Schema migrations affect the whole system.
  Mitigated by disciplined migration naming and rollback coverage.
- A failure in shared infrastructure or a critical application component can affect
  the entire application. Mitigated through Laravel's exception handler, health
  checks, process supervision, and queue worker isolation for async work.

---

## Validation

- Module coupling: measured by counting cross-module imports per domain. Dependency
  rules will be added to prevent modules from accessing another module's internal
  implementation directly.
- Future extraction readiness: each domain's public API surface should be expressible
  as a single service interface without internal coupling leaking out.
