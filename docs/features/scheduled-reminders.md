# Scheduled reminders

**Status:** Shipped (local + API-backed when synced)  
**Phase:** 2.5 + 3

## Problem

Users capture todos in the moment but need a nudge later. Reminders can be scheduled locally (offline) or delivered by the API when signed in (multi-device).

## Goals

- One-time reminder per todo
- Local push via `expo-notifications` when offline / not signed in
- API-backed push to all registered devices when signed in
- Cancel on complete or delete
- `reminderAt` syncs to Postgres; `notificationId` stays device-local

## User flow

### Offline (mobile)

```
Todo row → tap bell → set-reminder modal
    ↓ pick date/time or preset
Save → local notification scheduled (expo-notifications)
    ↓ at reminder time
Push notification with todo title
```

### Signed in (mobile or web)

```
Todo row → tap bell → set reminder
    ↓
PATCH /api/todos/:id { reminderAt }
    ↓ at reminder time
API reminder worker → push to all registered devices
```

Completing or deleting a todo cancels the reminder (local notification and/or server `reminderAt`).

## Data model

```typescript
type Todo = {
  // ...existing
  reminderAt?: string;       // ISO 8601 UTC — synced to server
  notificationId?: string;   // expo-notifications id (device-local only)
};
```

SQLite columns: `reminder_at`, `notification_id`  
Postgres columns: `reminder_at`, `reminder_sent_at`

## Sync contract

| Field | Synced? | Behavior |
| --- | --- | --- |
| `reminderAt` | Yes | Stored in Postgres; worker sends push at fire time |
| `notificationId` | No | Device-local; cleared when user signs in |
| `reminderSentAt` | Server only | Prevents duplicate sends |

**Multi-device:** Server sends to every registered device (Expo push on mobile, Web Push on web). See [push-notifications.md](./push-notifications.md).

**Migration:** Offline / logged-out users keep local scheduling. Signed-in users skip local `scheduleReminder` — the API handles delivery.

## Implementation status

### Phase A — Local foundation (shipped)

- [x] Shared types + Zod
- [x] SQLite migration
- [x] `reminder-scheduler.ts` + boot reconciliation
- [x] Store/hook: `setReminder`, cancel on complete/delete
- [x] `set-reminder.tsx` modal + bell on todo row (mobile)
- [x] `SetReminderDialog` on web

### Phase B — Polish

- [ ] Notification tap deep link (mobile + web)
- [ ] Expired reminder UX
- [ ] AI-suggested reminders from capture

### Phase C — API push (shipped)

- [x] Server-owned reminder delivery — [push-notifications.md](./push-notifications.md)
- [x] Multi-device + web push
- [x] Local scheduler as offline fallback only
- [x] Mobile: `reminderAt` syncs via API when signed in
- [x] Web: `reminderAt` via API only (no local scheduler)

## Related

- [push-notifications.md](./push-notifications.md) — API-backed push spec
- [web-app.md](./web-app.md) — web reminder UI
- [auth.md](./auth.md) — sign-in enables server reminders
- [todo-list.md](./todo-list.md)
- [PLAN.md](../../PLAN.md)
