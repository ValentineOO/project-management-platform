.PHONY: help up down build logs ps test lint migrate seed fresh shell-backend shell-frontend deploy k8s-status setup

help:
	@echo ""
	@echo "  Local development"
	@echo "  ─────────────────────────────────────────"
	@echo "  setup            Copy .env.example files and generate app key"
	@echo "  up               Start all services (dev)"
	@echo "  down             Stop and remove containers"
	@echo "  build            Build all Docker images (no cache)"
	@echo "  logs             Tail all container logs"
	@echo "  ps               Show running containers"
	@echo ""
	@echo "  Database"
	@echo "  ─────────────────────────────────────────"
	@echo "  migrate          Run database migrations"
	@echo "  seed             Seed the database"
	@echo "  fresh            Drop, migrate and reseed (destructive)"
	@echo ""
	@echo "  Quality"
	@echo "  ─────────────────────────────────────────"
	@echo "  test             Run backend and frontend test suites"
	@echo "  lint             Run PHP Pint and ESLint"
	@echo ""
	@echo "  Shells"
	@echo "  ─────────────────────────────────────────"
	@echo "  shell-backend    Open shell in backend container"
	@echo "  shell-frontend   Open shell in frontend container"
	@echo ""
	@echo "  Kubernetes"
	@echo "  ─────────────────────────────────────────"
	@echo "  deploy           Apply all Kubernetes manifests"
	@echo "  k8s-status       Show Kubernetes resource status"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	@[ -f backend/.env ] || cp backend/.env.example backend/.env
	@[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local
	docker compose run --rm backend php artisan key:generate
	@echo "Done. Edit backend/.env and frontend/.env.local before running 'make up'."

# ── Local dev ─────────────────────────────────────────────────────────────────

up:
	docker compose up -d
	@echo "Backend:  http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

down:
	docker compose down

build:
	docker compose build --no-cache

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

test:
	docker compose exec backend php artisan test
	docker compose exec frontend npm run test

lint:
	docker compose exec backend ./vendor/bin/pint --test
	docker compose exec frontend npm run lint

# ── Shells ────────────────────────────────────────────────────────────────────

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

# ── Kubernetes ────────────────────────────────────────────────────────────────

deploy:
	kubectl apply -f infrastructure/k8s/

k8s-status:
	kubectl get all -n codefyve
