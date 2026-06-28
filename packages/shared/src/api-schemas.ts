import { z } from 'zod';

export const todoSourceSchema = z.enum(['manual', 'capture', 'voice', 'watch']);

export const createTodoSchema = z.object({
  title: z.string().trim().min(1),
  source: todoSourceSchema.default('manual'),
  captureId: z.string().uuid().optional(),
  clientId: z.string().optional(),
  reminderAt: z.string().datetime().optional(),
  noteImageUri: z.string().optional(),
  noteAudioUri: z.string().optional(),
  transcript: z.string().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).optional(),
  completed: z.boolean().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
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
      createdAt: z.string(),
      reminderAt: z.string().datetime().optional(),
      noteImageUri: z.string().optional(),
      noteAudioUri: z.string().optional(),
      transcript: z.string().optional(),
    })
  ),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateCaptureInput = z.infer<typeof createCaptureSchema>;
export type SyncPayload = z.infer<typeof syncPayloadSchema>;
