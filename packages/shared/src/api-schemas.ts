import { z } from 'zod';

export const todoSourceSchema = z.enum(['manual', 'capture', 'voice', 'watch']);

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const createTodoSchema = z.object({
  title: z.string().trim().min(1),
  source: todoSourceSchema.default('manual'),
  listId: z.string().min(1).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  captureId: z.string().uuid().optional(),
  clientId: z.string().optional(),
  reminderAt: z.string().datetime().optional(),
  noteImageUri: z.string().optional(),
  noteAudioUri: z.string().optional(),
  transcript: z.string().optional(),
});

export const createTodosBatchSchema = z.object({
  listId: z.string().min(1).optional(),
  todos: z.array(createTodoSchema).min(1),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).optional(),
  completed: z.boolean().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
  listId: z.string().min(1).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  baseUpdatedAt: z.string().datetime().optional(),
});

export const reorderTodosSchema = z.object({
  listId: z.string().min(1),
  todoIds: z.array(z.string().min(1)).min(1),
});

export const createCaptureSchema = z.object({
  source: todoSourceSchema,
  transcript: z.string().optional(),
  mediaMimeType: z.string().optional(),
});

export const syncPayloadSchema = z.object({
  todos: z.array(
    z.object({
      clientId: z.string(),
      title: z.string(),
      completed: z.boolean(),
      source: todoSourceSchema,
      listId: z.string().min(1).optional(),
      sortOrder: z.number().int().nonnegative().optional(),
      createdAt: z.string(),
      reminderAt: z.string().datetime().optional(),
      noteImageUri: z.string().optional(),
      noteAudioUri: z.string().optional(),
      transcript: z.string().optional(),
    })
  ),
});

export const devicePlatformSchema = z.enum(['ios', 'android', 'web']);
export const pushProviderSchema = z.enum(['expo', 'web-push']);

export const registerDeviceSchema = z.object({
  platform: devicePlatformSchema,
  pushToken: z.string().min(1),
  pushProvider: pushProviderSchema,
  deviceName: z.string().trim().max(120).optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type CreateTodosBatchInput = z.infer<typeof createTodosBatchSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ReorderTodosInput = z.infer<typeof reorderTodosSchema>;
export type CreateCaptureInput = z.infer<typeof createCaptureSchema>;
export type SyncPayload = z.infer<typeof syncPayloadSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
