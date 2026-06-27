# Manual todo entry

**Status:** Shipped  
**Phase:** 1

## Problem

Not every todo comes from a note or photo — users need to type one quickly.

## User flow

1. Todos tab → **Add** (header)
2. Modal opens with text field
3. Enter title → **Add Todo**
4. Modal closes; todo appears at top of list with `source: 'manual'`

## UI

- **Route:** `apps/mobile/app/add-todo.tsx`
- **Component:** `add-todo-form.tsx`
- **Trigger:** `add-todo-header-button.tsx`

## Data

- `useTodos().addTodo(title, 'manual')`

## Acceptance criteria

- [x] Empty titles rejected
- [x] Keyboard submit works
- [x] Success haptic on save
