import { z } from 'zod';

export const chatMessageRoleSchema = z.enum(['user', 'assistant']);

export const chatAttachmentSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  url: z.string(),
  filename: z.string().optional(),
});

export const chatMessageMetadataSchema = z
  .object({
    model: z.string().optional(),
    finishReason: z.string().optional(),
    error: z.string().optional(),
    attachments: z.array(chatAttachmentSchema).optional(),
  })
  .optional();

export const chatThreadSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  role: chatMessageRoleSchema,
  content: z.string(),
  createdAt: z.string(),
  metadata: chatMessageMetadataSchema,
});

export const createChatThreadSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
});

export const updateChatThreadSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const listChatThreadsResponseSchema = z.object({
  threads: z.array(chatThreadSchema),
});

export const listChatMessagesResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  nextCursor: z.string().optional(),
});

export const chatRequestSchema = z.object({
  threadId: z.string().optional(),
  message: z.string().trim().min(1).max(32_000),
  attachmentId: z.string().optional(),
});

export const chatAttachmentUploadResponseSchema = z.object({
  attachment: chatAttachmentSchema,
});

export type ChatAttachment = z.infer<typeof chatAttachmentSchema>;
export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;
export type ChatMessageMetadata = z.infer<typeof chatMessageMetadataSchema>;
export type ChatThread = z.infer<typeof chatThreadSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type CreateChatThreadRequest = z.infer<typeof createChatThreadSchema>;
export type UpdateChatThreadRequest = z.infer<typeof updateChatThreadSchema>;
export type ListChatThreadsResponse = z.infer<typeof listChatThreadsResponseSchema>;
export type ListChatMessagesResponse = z.infer<typeof listChatMessagesResponseSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** SSE event payloads emitted by POST /api/chat */
export type ChatStreamEvent =
  | { type: 'thread'; threadId: string }
  | { type: 'user-message'; message: ChatMessage }
  | { type: 'assistant-start'; messageId: string }
  | { type: 'text-delta'; delta: string }
  | { type: 'assistant-end'; message: ChatMessage }
  | { type: 'error'; error: string }
  | { type: 'done' };
