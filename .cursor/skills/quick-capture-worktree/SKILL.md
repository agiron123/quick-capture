---
name: quick-capture-worktree
description: >-
  Creates and bootstraps Quick Capture git worktrees with isolated Neon branches,
  Docker Compose projects, and port blocks for parallel feature development.
  Use when the user asks to create a worktree, work in parallel on branches,
  set up a linked checkout, run docker:dev:worktree, or avoid port/Neon collisions.
---

# Quick Capture parallel worktrees

Read `docs/features/worktree-dev.md` for full architecture. This skill is the **operator workflow**.

## When to use

- User wants a **new feature branch in its own folder** without stopping the main dev stack
- User opened a **linked worktree** (`.git` is a file)
- User needs **Neon branch + Docker isolation** per branch

## Create a new worktree (preferred)

Run from the **main checkout** (or any worktree with `.git` as a directory):

```bash
npm run worktree:create -- <absolute-or-relative-path> -b <branch-name>
```

Examples:

```bash
npm run worktree:create -- ../quick-capture-feat-chat -b feat/chat
npm run worktree:create -- ../quick-capture-fix-sync fix-sync-conflicts
```

This runs:

1. `git worktree add`
2. Copy `.env` if the new folder lacks one
3. `npm install`
4. `npm run worktree:bootstrap` (Neon branch, `.env.worktree`, migrate)

Then:

```bash
cd <path>
npm run docker:dev:worktree
```

## Bootstrap only (existing linked worktree)

When the folder already exists but `.env.worktree` is missing:

```bash
cd <linked-worktree-path>
npm run worktree:bootstrap
npm run docker:dev:worktree
```

Flags:

| Flag | Purpose |
| --- | --- |
| `--force` | Re-bootstrap (new ports / env) |
| `--no-portless` | Use `localhost:<port>` URLs only |
| `--parent main` | Neon parent branch (default `main`) |
| `--database-url` / `--neon-auth-url` | Skip prompts when `neonctl` unavailable |
| `--manual` | Skip `neonctl`; prompt for Neon URLs |

## Commands cheat sheet

| Command | Where |
| --- | --- |
| `npm run worktree:create` | Main checkout — full setup |
| `npm run worktree:bootstrap` | Linked worktree only |
| `npm run docker:dev:worktree` | Linked worktree |
| `npm run docker:down:worktree` | Linked worktree |
| `npm run worktree:list` | Any checkout |
| `npm run worktree:teardown -- --delete-neon-branch` | Linked worktree cleanup |
| `npm run docker:dev` | **Main checkout only** |

## Cursor integration

- **Hook:** `.cursor/hooks.json` → `sessionStart` runs `session-init` and injects bootstrap instructions when `.env.worktree` is missing
- **Rule:** `.cursor/rules/parallel-worktree.mdc` — always-on reminder for linked worktrees

When opening a linked worktree in Cursor, check for `.env.worktree` first. If missing, run `npm run worktree:bootstrap` before suggesting `docker:dev:worktree`.

## Neon requirements

All branch-matched vars must come from the **same** Neon branch:

- `DATABASE_URL`
- `NEON_AUTH_URL` / `NEON_AUTH_BASE_URL` / `NEXT_PUBLIC_NEON_AUTH_URL`

With `neonctl`: branch is created automatically. Without it: user pastes URLs at bootstrap prompts.

Add Portless origins in Neon Auth when using `https://<slug>.quick-capture.localhost`.

## Teardown

```bash
npm run worktree:teardown -- --delete-neon-branch   # optional Neon delete
git worktree remove <path>                          # from main checkout
```

## Agent checklist

```
- [ ] Confirm linked vs main checkout (.git file vs directory)
- [ ] `.env` exists with shared secrets
- [ ] `.env.worktree` exists (run bootstrap if not)
- [ ] Use docker:dev:worktree (not docker:dev) in linked worktrees
- [ ] worktree:list shows expected ports / URLs
```
