#!/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
exec node scripts/worktree/session-init.mjs
