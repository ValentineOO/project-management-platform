.PHONY: help setup up down build logs ps \
        migrate seed fresh \
        test test-backend \
        lint lint-backend lint-frontend \
        shell-backend shell-frontend \
        deploy k8s-migrate k8s-status

help:
	@echo ""
	@echo "  Local development"
	@echo "  ─────────────────────────────────────────"
	@echo "  setup            Copy .env.example files and generate app key (safe to rerun)"
	@echo "  up               Start all services"
	@echo "  down             Stop and remove containers"
	@echo "  build            Build all Docker images"
	@echo "  logs             Tail all container logs"
	@echo "  ps               Show running containers"
	@echo ""
	@echo "  Database"
	@echo "  ─────────────────────────────────────────"
	@echo "  migrate          Run database migrations"
	@echo "  seed             Seed the database"
	@echo "  fresh            ⚠ DESTRUCTIVE: drop, migrate and reseed"
	@echo ""
	@echo "  Quality"
	@echo "  ─────────────────────────────────────────"
	@echo "  test             Run backend test suite"
	@echo "  test-backend     Run PHP tests only"
	@echo "  lint             Run all linters"
	@echo "  lint-backend     Run PHP Pint"
	@echo "  lint-frontend    Run ESLint"
	@echo ""
	@echo "  Shells"
	@echo "  ─────────────────────────────────────────"
	@echo "  shell-backend    Open shell in backend container"
	@echo "  shell-frontend   Open shell in frontend container"
	@echo ""
	@echo "  Kubernetes"
	@echo "  ─────────────────────────────────────────"
	@echo "  deploy           Apply manifests and wait for rollout"
	@echo "  k8s-migrate      Run database migration Job in cluster"
	@echo "  k8s-status       Show Kubernetes resource status"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	@[ -f backend/.env ] || cp backend/.env.example backend/.env
	@[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local
	@grep -q '^APP_KEY=base64:' backend/.env \
		|| docker compose run --rm backend php artisan key:generate
	@echo "Done. Edit backend/.env and frontend/.env.local before running 'make up'."

# ── Local dev ─────────────────────────────────────────────────────────────────

up:
	docker compose up -d
	@echo "Backend:  http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

# ── Database ──────────────────────────────────────────────────────────────────

migrate:
	docker compose exec backend php artisan migrate --force

seed:
	docker compose exec backend php artisan db:seed

fresh:
	docker compose exec backend php artisan migrate:fresh --seed

# ── Quality ───────────────────────────────────────────────────────────────────

test: test-backend

test-backend:
	docker compose exec backend php artisan test

lint: lint-backend lint-frontend

lint-backend:
	docker compose exec backend ./vendor/bin/pint --test

lint-frontend:
	docker compose exec frontend npm run lint

# ── Shells ────────────────────────────────────────────────────────────────────

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

# ── Kubernetes ────────────────────────────────────────────────────────────────

deploy:
	kubectl apply -f infrastructure/k8s/
	kubectl rollout status deployment/backend -n codefyve
	kubectl rollout status deployment/frontend -n codefyve

k8s-migrate:
	kubectl apply -f infrastructure/k8s/migration-job.yaml
	kubectl wait --for=condition=complete job/db-migrate -n codefyve --timeout=120s

k8s-status:
	kubectl get deployments,pods,services,ingress,hpa,jobs -n codefyve
