.PHONY: help dev stop build migrate seed test lint fresh logs shell-backend shell-frontend

help:
	@echo ""
	@echo "  dev              Start all services"
	@echo "  stop             Stop all services"
	@echo "  build            Build all Docker images"
	@echo "  migrate          Run database migrations"
	@echo "  seed             Seed the database"
	@echo "  fresh            Drop, migrate and seed (destructive)"
	@echo "  test             Run all tests"
	@echo "  lint             Run linters (PHP + TS)"
	@echo "  logs             Tail all container logs"
	@echo "  shell-backend    Open shell in backend container"
	@echo "  shell-frontend   Open shell in frontend container"
	@echo ""

dev:
	docker compose up -d
	@echo "Backend:  http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

stop:
	docker compose down

build:
	docker compose build --no-cache

migrate:
	docker compose exec backend php artisan migrate --force

seed:
	docker compose exec backend php artisan db:seed

fresh:
	docker compose exec backend php artisan migrate:fresh --seed

test:
	docker compose exec backend php artisan test
	docker compose exec frontend npm run test

lint:
	docker compose exec backend ./vendor/bin/pint --test
	docker compose exec frontend npm run lint

logs:
	docker compose logs -f

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh
