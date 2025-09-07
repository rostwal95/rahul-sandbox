# Developer convenience targets
# Override API_URL to point at a different API (e.g. API_URL=http://api:4000 make stripe-fake inside containers)
API_URL ?= http://localhost:4000

.PHONY: setup up seed test e2e stripe-fake

setup:
	cp -n .env.example .env || true
	@echo "Environment prepared."

up:
	docker compose up --build

seed:
	docker compose exec api bin/rails db:seed

reset-db:
	docker compose exec api bin/rails db:drop db:create db:migrate db:seed

stripe-fake:
	@echo "Triggering fake Stripe webhook -> $(API_URL)"; \
	curl -s -X POST $(API_URL)/v1/billing/webhook -d 'type=customer.subscription.updated&plan=price_fake_local' >/dev/null && echo 'OK'

e2e:
	cd apps/web && pnpm exec playwright test

