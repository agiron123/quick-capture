# Web sidebar navigation

**Status:** Shipped (core)  
**Phase:** 8

## Overview

Primary web navigation uses the shadcn **Sidebar** in [`apps/web/src/components/app-sidebar.tsx`](../../apps/web/src/components/app-sidebar.tsx), wrapped by [`AppShell`](../../apps/web/src/components/app-shell.tsx). The former horizontal nav strip and bottom mic FAB are removed.

## Layout

```
┌────────────┬─────────────────────────────┐
│ AppSidebar │ SidebarInset                │
│ - Nav      │ - Header (trigger, actions) │
│ - Lists    │ - Page content              │
│ - Quick    │   (chat: + thread sidebar)  │
│   capture  │                             │
└────────────┴─────────────────────────────┘
```

| Area | Component |
| --- | --- |
| Primary nav | `AppSidebar` — Todos, Capture, Voice, Chat, Devices |
| List picker | Sidebar “List” group — same `useLists()` as before |
| Quick capture | Sidebar footer link → `/voice` |
| Page actions | `AppShell` header — `headerRight`, theme, sign out |
| Chat threads | `ChatThreadSidebar` — secondary panel inside `/chat` |

## Responsive

- **Desktop:** Collapsible icon rail (`collapsible="icon"`, ⌘/Ctrl+B)
- **Mobile:** Sheet drawer via `SidebarTrigger` in header
- Collapsed state persisted in cookie (`sidebar_state`)

## Related

- [web-app.md](./web-app.md)
- [PLAN.md](../../PLAN.md) — Phase 8
