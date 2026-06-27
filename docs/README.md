# Quick Capture — Documentation

This folder is the implementation guide for Quick Capture. Start with [PLAN.md](../PLAN.md) for priorities, then open the relevant feature spec before building.

## Index

| Document | Purpose |
| --- | --- |
| [monorepo.md](./monorepo.md) | Turborepo layout, commands, adding packages |
| [architecture.md](./architecture.md) | App structure, data flow, conventions |
| [features/todo-list.md](./features/todo-list.md) | Todo list behavior (shipped) |
| [features/manual-entry.md](./features/manual-entry.md) | Manual add flow (shipped) |
| [features/camera-capture.md](./features/camera-capture.md) | Camera → AI → review (shipped) |
| [features/voice-capture.md](./features/voice-capture.md) | Voice → AI → review (**planned**) |

## Monorepo paths

| Old (pre-monorepo) | Current |
| --- | --- |
| `app/` | `apps/mobile/app/` |
| `components/` | `apps/mobile/components/` |
| `types/todo.ts` | `packages/shared` (re-exported in `apps/mobile/types/todo.ts`) |
| `server/` (planned) | `apps/api/` |
| `targets/watch/`, `wear/` (planned) | `native/watch/`, `native/wear/` |

## Adding a new feature

1. Add a row to [PLAN.md](../PLAN.md) roadmap.
2. Create `docs/features/<feature-name>.md` using the template below.
3. Link the spec from PLAN.md.
4. Mark status ✅ when shipped.

### Feature spec template

```markdown
# Feature name

**Status:** Planned | In progress | Shipped
**Phase:** 0 | 1 | 2 | 3 | 4 | 5

## Problem
What user need does this solve?

## User flow
Step-by-step interaction.

## UI / UX
Screens, components, navigation changes.

## Data model
Types, storage, new fields.

## Services / API
AI, permissions, env vars.

## Implementation tasks
- [ ] Task 1
- [ ] Task 2

## Acceptance criteria
- [ ] Criterion 1

## Open questions
- TBD
```
