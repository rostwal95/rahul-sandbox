#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-http://localhost:4000/v1}"
API_HOST="${API_HOST:-http://localhost:4000}"
COLOR=true
if [ -t 1 ]; then :; else COLOR=false; fi
GREEN='\033[32m'; RED='\033[31m'; YELLOW='\033[33m'; NC='\033[0m'
log(){ if $COLOR; then echo -e "$1"; else echo "$(echo -e "$1" | sed 's/\\x1B\\[[0-9;]*[A-Za-z]//g')"; fi }
req(){
  local method=$1
  local path=$2
  local data=${3:-}
  local url="$API_BASE$path"
  # Portable millisecond timestamp (macOS BSD date lacks %N reliably)
  local start=$(perl -MTime::HiRes=time -e 'printf("%.0f", time()*1000)')
  if [ -n "$data" ]; then
    resp=$(curl -s -o /dev/stderr -w 'HTTP_STATUS:%{http_code}' -X "$method" -H 'Content-Type: application/json' "$url" -d "$data" || true)
  else
    resp=$(curl -s -o /dev/stderr -w 'HTTP_STATUS:%{http_code}' -X "$method" "$url" || true)
  fi
  status=$(echo "$resp" | tr -d '\n' | sed -E 's/.*HTTP_STATUS:([0-9]{3}).*/\1/')
  end=$(perl -MTime::HiRes=time -e 'printf("%.0f", time()*1000)')
  dur=$((end-start))
  if [[ "$status" =~ ^2|3 ]]; then
    log "${GREEN}✔${NC} $method $path ($status) ${dur}ms"
  elif [[ "$status" == 401 || "$status" == 403 ]]; then
    log "${YELLOW}◼${NC} $method $path ($status auth) ${dur}ms"
  else
    log "${RED}✖${NC} $method $path ($status) ${dur}ms"
  fi
}

log "${YELLOW}API Smoke against $API_BASE${NC}"

# Health (non-versioned)
curl -s "$API_HOST/health" -o /dev/stderr -w 'HTTP_STATUS:%{http_code}' >/dev/null 2>&1 || true


# Core reads (will 401/403 if auth required, still useful visibility)
req GET /pages
req GET /broadcasts
req GET /experiments
req GET /metrics/broadcast_series
req GET /rum/summary
req GET /feature_flags

# Public subscribe flow (fake email each run)
email="smoke+$(date +%s)@example.test"
req POST /public/subscribe "{\"email\":\"$email\",\"slug\":\"test\"}"

# Dev helpers (only available in development)
req GET /dev/latest_confirmation || true
req GET /dev/events || true

log "${YELLOW}Done.${NC}"
