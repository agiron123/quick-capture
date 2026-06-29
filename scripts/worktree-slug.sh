#!/usr/bin/env sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$ROOT/scripts/worktree/slug.mjs" "$@"
