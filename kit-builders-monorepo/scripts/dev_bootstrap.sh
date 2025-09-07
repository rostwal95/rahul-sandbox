#!/usr/bin/env bash
# Comprehensive local dev bootstrap for Kit Builders
# Responsibilities:
#  1. Ensure required tools (git, curl, docker) present
#  2. Ensure Node (via corepack) & pnpm install
#  3. Ensure Ruby 3.4.4 (via mise if available, else rbenv / asdf fallback notice)
#  4. Launch Postgres + Redis via Docker (unless already running)
#  5. Install Ruby gems & JS deps
#  6. Prepare Rails DB & seed demo user/content
#  7. Start Rails (port 4000), Sidekiq, and Next.js (port 3000)
#  8. Run backend endpoint smoke + minimal frontend page fetch checks
#  9. Provide summary + next steps
# Safe to re-run: idempotent where possible.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

API_DIR=apps/api
WEB_DIR=apps/web
RUBY_VER=3.4.4
PG_CONTAINER=kitbuilders-pg
REDIS_CONTAINER=kitbuilders-redis
PG_IMAGE=postgres:15
REDIS_IMAGE=redis:7
PG_PORT=5432
REDIS_PORT=6379
API_PORT=4000
WEB_PORT=3000
LOG_DIR="$ROOT_DIR/.dev-logs"
mkdir -p "$LOG_DIR"

COLOR=true; [[ -t 1 ]] || COLOR=false
red(){ $COLOR && echo -e "\033[31m$*\033[0m" || echo "$*"; }
green(){ $COLOR && echo -e "\033[32m$*\033[0m" || echo "$*"; }
yellow(){ $COLOR && echo -e "\033[33m$*\033[0m" || echo "$*"; }
info(){ green "[OK] $*"; }
step(){ echo; yellow "==> $*"; }
warn(){ yellow "[WARN] $*"; }
fail(){ red "[FAIL] $*"; exit 1; }

require_cmd(){ command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"; }
for c in git curl docker; do require_cmd $c; done

step "Ensuring Node & pnpm"
if ! command -v node >/dev/null 2>&1; then fail "Node not found. Install Node 22.x (e.g. via mise or nvm) and re-run"; fi
corepack enable >/dev/null 2>&1 || true

step "Ensuring Ruby $RUBY_VER"
if command -v mise >/dev/null 2>&1; then
  if ! mise list ruby | grep -q "$RUBY_VER"; then
    mise install ruby@$RUBY_VER || fail "Failed installing Ruby $RUBY_VER via mise"
  fi
  export PATH="$(mise where ruby@$RUBY_VER)/bin:$PATH" || true
elif command -v rbenv >/dev/null 2>&1; then
  if ! rbenv versions | grep -q "$RUBY_VER"; then rbenv install "$RUBY_VER"; fi
  rbenv local "$RUBY_VER"
else
  warn "Neither mise nor rbenv found. Ensure Ruby $RUBY_VER is installed manually."
fi
ruby -v | grep -q "$RUBY_VER" || fail "Ruby version mismatch (expected $RUBY_VER)"
info "Ruby $(ruby -v)"

step "Starting Postgres container ($PG_CONTAINER)"
if ! docker ps --format '{{.Names}}' | grep -q "^$PG_CONTAINER$"; then
  if docker ps -a --format '{{.Names}}' | grep -q "^$PG_CONTAINER$"; then
    docker start "$PG_CONTAINER" >/dev/null
  else
    docker run -d --name "$PG_CONTAINER" -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=kit_builders_dev -p $PG_PORT:5432 "$PG_IMAGE" >/dev/null
  fi
else
  info "Postgres already running"
fi

step "Starting Redis container ($REDIS_CONTAINER)"
if ! docker ps --format '{{.Names}}' | grep -q "^$REDIS_CONTAINER$"; then
  if docker ps -a --format '{{.Names}}' | grep -q "^$REDIS_CONTAINER$"; then
    docker start "$REDIS_CONTAINER" >/dev/null
  else
    docker run -d --name "$REDIS_CONTAINER" -p $REDIS_PORT:6379 "$REDIS_IMAGE" >/dev/null
  fi
else
  info "Redis already running"
fi

step "Installing JS dependencies (pnpm)"
pnpm install --frozen-lockfile || fail "pnpm install failed"

step "Installing Ruby gems"
(cd "$API_DIR" && bundle install) || fail "bundle install failed"

step "Database prepare & seed"
(cd "$API_DIR" && bin/rails db:prepare) || fail "db:prepare failed"
# Ensure a demo user exists (idempotent)
cat <<'RUBY' | (cd "$API_DIR" && bin/rails runner -)
email = 'demo@kit.test'
pass = 'password123'
if User.find_by(email: email)
  puts "User already present"
else
  u = User.create!(email: email, password: pass, password_confirmation: pass)
  puts "Created user #{u.email}"
end
unless Page.first
  Page.create!(org_id: 1, slug: 'welcome', status: 'draft', theme_json: { colors: { brand: '#0a0a0a' } }) rescue nil
end
unless Org.first
  Org.create!(name: 'Demo Org', plan: 'Starter')
end
RUBY

step "Launching Rails API & Sidekiq"
API_LOG="$LOG_DIR/rails.log"; SIDEKIQ_LOG="$LOG_DIR/sidekiq.log"
kill $(cat "$LOG_DIR/rails.pid" 2>/dev/null) >/dev/null 2>&1 || true
kill $(cat "$LOG_DIR/sidekiq.pid" 2>/dev/null) >/dev/null 2>&1 || true
(APP_HOST=localhost APP_PORT=$API_PORT (cd "$API_DIR" && bin/rails s -p $API_PORT) >"$API_LOG" 2>&1 & echo $! > "$LOG_DIR/rails.pid")
(cd "$API_DIR" && bundle exec sidekiq -q default -q mailers >"$SIDEKIQ_LOG" 2>&1 & echo $! > "$LOG_DIR/sidekiq.pid")

step "Wait for API port"
for i in {1..30}; do if curl -s "http://localhost:$API_PORT/health" >/dev/null 2>&1; then break; fi; sleep 1; done
curl -s "http://localhost:$API_PORT/health" || warn "Health endpoint not responding"

step "Launching Next.js web"
WEB_LOG="$LOG_DIR/web.log"
kill $(cat "$LOG_DIR/web.pid" 2>/dev/null) >/dev/null 2>&1 || true
(pnpm --filter @kit/web dev >"$WEB_LOG" 2>&1 & echo $! > "$LOG_DIR/web.pid")

step "Wait for web port"
for i in {1..40}; do if curl -s "http://localhost:$WEB_PORT" >/dev/null 2>&1; then break; fi; sleep 1; done

step "Authenticate to API (Devise) and capture JWT cookie (if any)"
LOGIN_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:$API_PORT/v1/auth/sign_in" -H 'Content-Type: application/json' -d '{"user":{"email":"demo@kit.test","password":"password123"}}') || true
if [ "$LOGIN_STATUS" != "200" ]; then warn "Login status $LOGIN_STATUS (protected endpoints will 302)"; fi

step "Backend smoke (selected)"
BACKEND_ENDPOINTS=(
  "/v1/pages" "/v1/feature_flags" "/v1/metrics/funnel" "/v1/rum/summary" "/v1/experiments"
)
for ep in "${BACKEND_ENDPOINTS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$API_PORT$ep")
  echo "  $ep -> $code"
done

step "Frontend page checks"
done
COOKIE_JAR="$LOG_DIR/web_cookies.txt"
rm -f "$COOKIE_JAR"
# Login through the Next.js route so the server sets kit_token cookie
LOGIN_WEB_CODE=$(curl -s -o /dev/null -w '%{http_code}' -c "$COOKIE_JAR" -H 'Content-Type: application/json' -X POST "http://localhost:$WEB_PORT/api/session/login" -d '{"email":"demo@kit.test","password":"password123"}') || true
if [ "$LOGIN_WEB_CODE" != "200" ]; then warn "Web login route returned $LOGIN_WEB_CODE"; else info "Web login succeeded"; fi

FRONTEND_ROUTES=("/" "/login" "/dashboard" "/broadcast" "/page" "/sequence")
for r in "${FRONTEND_ROUTES[@]}"; do
  # Use cookies for potential protected routes
  code=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w '%{http_code}' "http://localhost:$WEB_PORT$r")
  echo "  $r -> $code"
  if [ "$r" = "/dashboard" ] && [ "$code" != "200" ]; then warn "/dashboard returned $code (expected 200 after auth)"; fi
done

step "Summary"
ps_summary(){ ps -o pid,ppid,command -p "$1" 2>/dev/null | tail -n +2; }
echo "Rails PID: $(cat $LOG_DIR/rails.pid 2>/dev/null)"; ps_summary $(cat $LOG_DIR/rails.pid 2>/dev/null || echo 0)
echo "Sidekiq PID: $(cat $LOG_DIR/sidekiq.pid 2>/dev/null)"; ps_summary $(cat $LOG_DIR/sidekiq.pid 2>/dev/null || echo 0)
echo "Web PID: $(cat $LOG_DIR/web.pid 2>/dev/null)"; ps_summary $(cat $LOG_DIR/web.pid 2>/dev/null || echo 0)

green "Bootstrap complete. Logs in $LOG_DIR. Ctrl+C will NOT stop background processes; run scripts/dev_shutdown.sh to stop." 

exit 0
