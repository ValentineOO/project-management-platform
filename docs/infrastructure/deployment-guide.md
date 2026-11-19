# Deployment Guide

## Local development

### Prerequisites

- Docker Engine 24+
- Docker Compose v2
- Make (optional)

### Setup

```bash
# 1. Generate application key
docker compose run --rm backend php artisan key:generate --show
# Copy the output into backend/.env as APP_KEY=

# 2. Start all services
docker compose up -d --build

# 3. Run migrations
docker compose exec backend php artisan migrate

# 4. Seed demo data (optional)
docker compose exec backend php artisan db:seed
```

### Service ports

| Service | Host port | Notes |
|---|---|---|
| Frontend (Next.js dev) | 3000 | HMR enabled; bind-mounted source |
| Backend API (Laravel) | 8000 | Direct access, no Nginx |
| Nginx proxy | 8082 | Routes `/api/*` to backend, `/*` to frontend |
| PostgreSQL | 5433 | Host-mapped for local clients |
| Redis | 6380 | Host-mapped for local clients |

### Environment variables (backend/.env)

| Variable | Required | Description |
|---|---|---|
| `APP_KEY` | Yes | Base64-encoded 32-byte key; generate once per environment |
| `APP_ENV` | Yes | `local` for development, `production` for deployment |
| `APP_DEBUG` | Yes | `true` locally, `false` in production |
| `DB_HOST` | Yes | Hostname of PostgreSQL instance |
| `DB_DATABASE` | Yes | Database name |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `REDIS_HOST` | Yes | Hostname of Redis instance |
| `FRONTEND_URL` | Yes | Used for Sanctum CORS config (e.g. `http://localhost:3000`) |
| `SANCTUM_STATEFUL_DOMAINS` | Yes | Comma-separated list of frontend domains |

### Data persistence

PostgreSQL data is stored in the `postgres_data` named Docker volume. Redis data in `redis_data`.

Both volumes survive `docker compose stop` and `docker compose down`.

`docker compose down -v` destroys all volumes. Use this only for a full reset.

---

## Kubernetes deployment

### Prerequisites

- Kubernetes cluster with Nginx ingress controller installed
- External PostgreSQL 16 and Redis 7 instances provisioned
- Container images pushed to an accessible registry
- `kubectl` configured for the target cluster

### Pre-deploy: configure secrets and config

Edit `infrastructure/k8s/02-secret.yaml` and replace all `REPLACE_WITH_*` placeholders:

| Placeholder | Value |
|---|---|
| `REPLACE_WITH_GENERATED_KEY` | Output of `php artisan key:generate --show` |
| `REPLACE_WITH_DB_HOST` | Managed PostgreSQL hostname |
| `REPLACE_WITH_DB_NAME` | Database name |
| `REPLACE_WITH_DB_USER` | Database username |
| `REPLACE_WITH_DB_PASSWORD` | Database password |
| `REPLACE_WITH_REDIS_HOST` | Managed Redis hostname |
| `REPLACE_WITH_YOUR_DOMAIN` | Public domain (e.g. `app.example.com`) |

Edit `infrastructure/k8s/08-ingress.yaml` and replace `REPLACE_WITH_YOUR_DOMAIN` with the same domain.

### Deploy sequence

```bash
# Namespace
kubectl apply -f infrastructure/k8s/00-namespace.yaml

# Configuration
kubectl apply -f infrastructure/k8s/01-configmap.yaml
kubectl apply -f infrastructure/k8s/02-secret.yaml

# Migrations (must complete before backend starts serving)
kubectl delete job db-migrate -n codefyve --ignore-not-found
kubectl apply -f infrastructure/k8s/09-migration-job.yaml
kubectl wait --for=condition=complete job/db-migrate -n codefyve --timeout=120s

# Application
kubectl apply -f infrastructure/k8s/03-backend-deployment.yaml
kubectl apply -f infrastructure/k8s/04-backend-service.yaml
kubectl apply -f infrastructure/k8s/05-frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/06-frontend-service.yaml
kubectl apply -f infrastructure/k8s/07-worker-deployment.yaml

# Ingress and autoscaling
kubectl apply -f infrastructure/k8s/08-ingress.yaml
kubectl apply -f infrastructure/k8s/10-hpa.yaml
```

### NEXT_PUBLIC_API_URL

This variable must be passed as a Docker build argument, not a runtime env var. Next.js bakes `NEXT_PUBLIC_*` variables into the client bundle at build time:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-domain \
  -t your-registry/codefyve/frontend:sha \
  ./frontend
```

Passing it only in the K8s Secret has no effect on an already-built image.

### TLS

The ingress is configured for HTTP by default. To enable HTTPS with cert-manager:

1. Install cert-manager and create a `ClusterIssuer` named `letsencrypt-prod`.
2. Uncomment the `cert-manager.io/cluster-issuer` annotation in `08-ingress.yaml`.
3. Uncomment the `tls:` block in `08-ingress.yaml` and replace the placeholder host.
4. Apply the updated ingress manifest.

---

## Operational tasks

### Check pod status

```bash
kubectl get pods -n codefyve
kubectl describe pod <pod-name> -n codefyve
```

### View application logs

```bash
# Backend
kubectl logs -n codefyve -l app.kubernetes.io/component=backend -f

# Worker
kubectl logs -n codefyve -l app.kubernetes.io/component=worker -f

# Frontend
kubectl logs -n codefyve -l app.kubernetes.io/component=frontend -f
```

### Run migrations manually (K8s)

```bash
kubectl delete job db-migrate -n codefyve --ignore-not-found
kubectl apply -f infrastructure/k8s/09-migration-job.yaml
kubectl wait --for=condition=complete job/db-migrate -n codefyve --timeout=120s
kubectl logs -n codefyve -l app.kubernetes.io/component=migration
```

### Rollback a deployment

```bash
kubectl rollout undo deployment/backend -n codefyve
kubectl rollout undo deployment/frontend -n codefyve
kubectl rollout status deployment/backend -n codefyve
```

---

## Autoscaling

The HPA in `10-hpa.yaml` scales the backend deployment:

| Setting | Value |
|---|---|
| Min replicas | 2 |
| Max replicas | 8 |
| CPU scale-up threshold | 70% |
| Memory scale-up threshold | 80% |

Memory-based scaling requires a custom metrics provider (e.g. `metrics-server` with memory support). The CPU target works with the default `metrics-server`. If memory HPA fails silently, remove the memory metric from `10-hpa.yaml` until the provider is confirmed.

The queue worker (`07-worker-deployment.yaml`) is a single replica with no HPA. Add a worker HPA if queue depth becomes a bottleneck, using a Redis-based custom metric.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| Backend pods crash-looping | `kubectl logs` for startup errors; verify all Secret values are set correctly |
| 502 Bad Gateway from Nginx | Backend readiness probe failing; check `/api/health` returns 200 |
| Migrations fail on deploy | Check job logs; verify `DB_HOST` and credentials in Secret; ensure the database exists |
| Frontend shows blank page | `NEXT_PUBLIC_API_URL` was not set at image build time; rebuild the frontend image with the correct build arg |
| Session not persisting | `SANCTUM_STATEFUL_DOMAINS` does not match the frontend origin; verify exact domain match including protocol |
