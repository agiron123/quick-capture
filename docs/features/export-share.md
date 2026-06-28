# Export and share

Export the active todo list as plain text or JSON. Mobile uses the system share sheet; web supports copy and download.

## Scope (v1)

| Platform | Actions |
| --- | --- |
| Mobile | Share plain-text checklist via `Share` API |
| Web | Copy as text · Download JSON |

Exports include all todos in the **active list** (top-level + subtasks). Device-local fields (`notificationId`, media URIs) are omitted from JSON.

## Text format

```text
# Inbox

- [ ] Buy milk
  - [ ] Oat milk
- [x] Call dentist
```

Subtasks are indented under their parent. Optional metadata lines (due date, priority, tags) append when set.

## JSON format

Array of todos with sync-relevant fields only (`id`, `title`, `completed`, `source`, `listId`, `parentId`, `sortOrder`, `createdAt`, `updatedAt`, `priority`, `dueAt`, `reminderAt`, `tags`, `transcript`).

## Follow-ups

- Export filtered view only
- CSV export
- Share sheet with JSON on mobile
