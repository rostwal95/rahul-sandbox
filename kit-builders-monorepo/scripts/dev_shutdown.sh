#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
LOG_DIR="$ROOT_DIR/.dev-logs"
red(){ echo -e "\033[31m$*\033[0m"; }
green(){ echo -e "\033[32m$*\033[0m"; }
stop_pid(){ if [ -f "$1" ]; then pid=$(cat "$1"); if ps -p $pid >/dev/null 2>&1; then kill $pid && green "Stopped $pid" || red "Failed $pid"; fi; rm -f "$1"; fi }
stop_pid "$LOG_DIR/rails.pid"
stop_pid "$LOG_DIR/sidekiq.pid"
stop_pid "$LOG_DIR/web.pid"

echo "Optional: docker stop kitbuilders-pg kitbuilders-redis" || true
echo "Done"
