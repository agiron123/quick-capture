import type { ChatMessage, ChatMessageMetadata, ChatThread } from '@quick-capture/shared';

import type { chatMessages, chatThreads } from '../db/schema.js';

type ChatThreadRow = typeof chatThreads.$inferSelect;
type ChatMessageRow = typeof chatMessages.$inferSelect;

export function serializeChatThread(row: ChatThreadRow): ChatThread {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeChatMessage(row: ChatMessageRow): ChatMessage {
  const metadata = row.metadata as ChatMessageMetadata | null;
  return {
    id: row.id,
    threadId: row.threadId,
    role: row.role as ChatMessage['role'],
    content: row.content,
    createdAt: row.createdAt,
    metadata: metadata ?? undefined,
  };
}
