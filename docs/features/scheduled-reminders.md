# Scheduled reminders

**Status:** Shipped  
**Phase:** 2.5

## Problem

Users capture todos in the moment but need a nudge later. Scheduled local push reminders fire at a chosen date/time without requiring cloud sync.

## Goals

- One-time reminder per todo
- Local push via `expo-notifications`
- Cancel on complete or delete
- Schema supports future cloud sync (`reminderAt` synced; `notificationId` device-local)

## User flow

```
Todo row → tap bell → set-reminder modal
    ↓ pick date/time or preset
Save → local notification scheduled
    ↓ at reminder time
Push notification with todo title
```

Completing or deleting a todo cancels its notification.

## Data model

```typescript
type Todo = {
  // ...existing
  reminderAt?: string;       // ISO 8601 UTC
  notificationId?: string;   // expo-notifications id (not synced)
};
```

SQLite columns: `reminder_at`, `notification_id`

## Sync contract (Phase 3)

Phase 2.5 uses **local** scheduling only. Phase 3 moves delivery to the **API**:

| Field | Synced? | Phase 3 behavior |
| --- | --- | --- |
| `reminderAt` | Yes | Stored in Postgres; worker sends push at fire time |
| `notificationId` | No | Device-local; dropped when user is signed in + synced |
| `reminderSentAt` | Server only | Prevents duplicate sends |

**Multi-device:** Server sends to every registered device (Expo push on mobile, Web Push on web). See [push-notifications.md](./push-notifications.md).

**Migration:** Offline / logged-out users keep local scheduling. Signed-in synced users skip local `scheduleReminder` — the API handles delivery.

## Implementation status

### Phase A — Foundation

- [x] Shared types + Zod
- [x] SQLite migration
- [x] `reminder-scheduler.ts` + boot reconciliation
- [x] Store/hook: `setReminder`, cancel on complete/delete
- [x] `set-reminder.tsx` modal + bell on todo row

### Phase B — Polish

- [ ] Notification tap deep link
- [ ] Expired reminder UX
- [ ] AI-suggested reminders from capture

### Phase C — API push (Phase 3)

- [ ] Server-owned reminder delivery — [push-notifications.md](./push-notifications.md)
- [ ] Multi-device + web push
- [ ] Local scheduler as offline fallback only

## Related

- [push-notifications.md](./push-notifications.md) — Phase 3 API-backed push spec
- [todo-list.md](./todo-list.md)
- [PLAN.md](../../PLAN.md)
