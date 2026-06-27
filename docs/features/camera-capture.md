# Camera capture

**Status:** Shipped  
**Phase:** 1

## Problem

Handwritten notes on paper should become todos without retyping.

## User flow

1. **Capture** tab → grant camera permission if needed
2. Take photo or pick from gallery
3. AI extracts todos (loading overlay)
4. **Review Todos** modal → edit/remove/add lines
5. **Save** → todos added with `source: 'capture'` and optional `noteImageUri`

## UI

- **Route:** `apps/mobile/app/(tabs)/capture.tsx`
- **Component:** `apps/mobile/components/capture-camera.tsx`
- **Review:** `apps/mobile/app/review-todos.tsx`

## Services

- `services/ai-extract-todos.ts`
- OpenAI `gpt-4o-mini` vision (or mock)

## Permissions

- Camera — `expo-camera` plugin in `app.json`
- Photo library — `expo-image-picker` plugin

## Acceptance criteria

- [x] Camera, gallery, flip controls
- [x] Processing state while AI runs
- [x] Review before save
- [x] Thumbnail on todo when image URI stored

## Reference for voice feature

Voice capture should mirror this pipeline: **record → AI → review → save**, reusing or extending `review-todos.tsx`.
