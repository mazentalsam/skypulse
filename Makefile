.PHONY: install dev backend frontend test test-backend test-frontend typecheck lint build docker clean

install: ## Install all dependencies
	pip install -r requirements.txt
	cd frontend && npm install

dev: ## Start both backend and frontend for development
	@echo "Starting backend on :5000 and frontend on :5173..."
	@make backend & make frontend

backend: ## Start Flask backend
	python -m flask --app backend.app run --port 5000 --reload

frontend: ## Start Vite dev server
	cd frontend && npm run dev

test: test-backend test-frontend ## Run all tests

test-backend: ## Run pytest
	python -m pytest backend/tests/ -v

test-frontend: ## Run Vitest
	cd frontend && npm test

test-e2e: ## Run Playwright E2E tests (requires backend + frontend running)
	cd frontend && npx playwright test

typecheck: ## Run TypeScript type checker
	cd frontend && npx tsc --noEmit

lint: ## Lint frontend
	cd frontend && npm run lint

build: ## Build frontend for production
	cd frontend && npm run build

docker: ## Build and run Docker container
	docker build -t skypulse .
	docker run -p 80:80 --env-file .env skypulse

clean: ## Remove build artifacts and caches
	rm -rf frontend/dist frontend/node_modules/.vite
	rm -rf backend/__pycache__ backend/**/__pycache__
	rm -rf .pytest_cache backend/.pytest_cache

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
