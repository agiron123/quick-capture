import type { ChatAttachment, ChatMessage, ChatMessageMetadata } from '@quick-capture/shared';
import { and, asc, desc, eq, gt } from 'drizzle-orm';

import {
  assertMiniMaxChatConfigured,
  getAiConfig,
  getChatMaxHistoryMessages,
} from '../ai/config.js';
import {
  completeMiniMaxChat,
  streamMiniMaxChatCompletion,
  type ChatCompletionMessage,
} from '../ai/chat-stream.js';
import {
  CHAT_AGENT_SYSTEM_PROMPT,
  CHAT_TITLE_SYSTEM_PROMPT,
} from '../ai/prompts.js';
import { getDatabase } from '../db/client.js';
import { chatMessages, chatThreads } from '../db/schema.js';
import { createId } from '../lib/id.js';
import { serializeChatMessage, serializeChatThread } from '../lib/chat-serialize.js';
import { readChatAttachment } from './chat-attachment-storage.js';

const DEFAULT_THREAD_TITLE = 'New chat';

export async function listUserChatThreads(userId: string) {
  const db = getDatabase()!;
  const rows = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .orderBy(desc(chatThreads.updatedAt));

  return rows.map(serializeChatThread);
}

export async function getUserChatThread(userId: string, threadId: string) {
  const db = getDatabase()!;
  const rows = await db
    .select()
    .from(chatThreads)
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)))
    .limit(1);

  const row = rows[0];
  return row ? serializeChatThread(row) : null;
}

export async function createUserChatThread(userId: string, title?: string) {
  const db = getDatabase()!;
  const now = new Date().toISOString();
  const thread = {
    id: createId(),
    userId,
    title: title?.trim() || DEFAULT_THREAD_TITLE,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(chatThreads).values(thread);
  return serializeChatThread(thread);
}

export async function updateUserChatThreadTitle(
  userId: string,
  threadId: string,
  title: string
) {
  const db = getDatabase()!;
  const existing = await getUserChatThread(userId, threadId);
  if (!existing) return null;

  const updatedAt = new Date().toISOString();
  await db
    .update(chatThreads)
    .set({ title, updatedAt })
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)));

  return { ...existing, title, updatedAt };
}

export async function deleteUserChatThread(userId: string, threadId: string) {
  const existing = await getUserChatThread(userId, threadId);
  if (!existing) return false;

  const db = getDatabase()!;
  await db
    .delete(chatThreads)
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)));
  return true;
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString('base64url');
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const separatorIndex = decoded.indexOf('|');
    if (separatorIndex === -1) return null;
    return {
      createdAt: decoded.slice(0, separatorIndex),
      id: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export async function listThreadMessages(
  userId: string,
  threadId: string,
  options: { cursor?: string; limit?: number }
) {
  const thread = await getUserChatThread(userId, threadId);
  if (!thread) return null;

  const db = getDatabase()!;
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const decodedCursor = options.cursor ? decodeCursor(options.cursor) : null;

  const conditions = [eq(chatMessages.threadId, threadId)];
  if (decodedCursor) {
    conditions.push(
      gt(chatMessages.createdAt, decodedCursor.createdAt)
    );
  }

  const rows = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(asc(chatMessages.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const messages = page.map(serializeChatMessage);
  const last = page[page.length - 1];

  return {
    messages,
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : undefined,
  };
}

async function getRecentMessagesForContext(threadId: string) {
  const db = getDatabase()!;
  const maxMessages = getChatMaxHistoryMessages();
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(maxMessages);

  return rows.reverse().map(serializeChatMessage);
}

async function insertChatMessage(input: {
  threadId: string;
  role: ChatMessage['role'];
  content: string;
  metadata?: ChatMessageMetadata;
}) {
  const db = getDatabase()!;
  const now = new Date().toISOString();
  const message = {
    id: createId(),
    threadId: input.threadId,
    role: input.role,
    content: input.content,
    metadata: input.metadata ?? null,
    createdAt: now,
  };

  await db.insert(chatMessages).values(message);
  return serializeChatMessage(message);
}

async function touchThread(threadId: string) {
  const db = getDatabase()!;
  const updatedAt = new Date().toISOString();
  await db.update(chatThreads).set({ updatedAt }).where(eq(chatThreads.id, threadId));
  return updatedAt;
}

function buildCompletionMessages(
  history: ChatMessage[],
  visionAttachment?: { base64: string; mimeType: string }
): ChatCompletionMessage[] {
  const mapped = history.map((message, index) => {
    const isLatestUser =
      index === history.length - 1 && message.role === 'user' && visionAttachment;

    if (isLatestUser) {
      return {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: message.content },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:${visionAttachment.mimeType};base64,${visionAttachment.base64}`,
            },
          },
        ],
      };
    }

    return {
      role: message.role as 'user' | 'assistant',
      content: message.content,
    };
  });

  return [{ role: 'system', content: CHAT_AGENT_SYSTEM_PROMPT }, ...mapped];
}

function buildAttachmentDto(
  attachmentId: string,
  mimeType: string,
  filename?: string
): ChatAttachment {
  return {
    id: attachmentId,
    mimeType,
    url: `/api/chat/attachments/${attachmentId}/media`,
    filename,
  };
}

async function generateThreadTitle(firstUserMessage: string): Promise<string> {
  const config = getAiConfig();
  assertMiniMaxChatConfigured(config);

  const title = await completeMiniMaxChat(config, [
    { role: 'system', content: CHAT_TITLE_SYSTEM_PROMPT },
    { role: 'user', content: firstUserMessage },
  ]);

  const cleaned = title.replace(/^["']|["']$/g, '').trim();
  if (!cleaned) return DEFAULT_THREAD_TITLE;
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}…` : cleaned;
}

export type ChatStreamWriter = {
  write: (event: Record<string, unknown>) => Promise<void>;
};

export async function handleChatStream(
  userId: string,
  input: { threadId?: string; message: string; attachmentId?: string },
  writer: ChatStreamWriter
) {
  const config = getAiConfig();
  assertMiniMaxChatConfigured(config);

  let attachmentMeta: ChatAttachment | undefined;
  let visionAttachment: { base64: string; mimeType: string } | undefined;

  if (input.attachmentId) {
    const media = await readChatAttachment(userId, input.attachmentId);
    if (!media) {
      throw new Error('Attachment not found');
    }
    if (!media.mimeType.startsWith('image/')) {
      throw new Error('Only image attachments are supported');
    }
    attachmentMeta = buildAttachmentDto(input.attachmentId, media.mimeType);
    visionAttachment = {
      base64: media.buffer.toString('base64'),
      mimeType: media.mimeType,
    };
  }

  let thread =
    input.threadId != null ? await getUserChatThread(userId, input.threadId) : null;

  if (input.threadId && !thread) {
    throw new Error('Thread not found');
  }

  const isNewThread = !thread;
  if (!thread) {
    thread = await createUserChatThread(userId);
  }

  await writer.write({ type: 'thread', threadId: thread.id });

  const userMessage = await insertChatMessage({
    threadId: thread.id,
    role: 'user',
    content: input.message,
    metadata: attachmentMeta ? { attachments: [attachmentMeta] } : undefined,
  });
  await writer.write({ type: 'user-message', message: userMessage });

  const history = await getRecentMessagesForContext(thread.id);
  const completionMessages = buildCompletionMessages(history, visionAttachment);
  const assistantMessageId = createId();

  await writer.write({ type: 'assistant-start', messageId: assistantMessageId });

  let assistantContent = '';
  let finishReason: string | undefined;

  try {
    const result = await streamMiniMaxChatCompletion(
      config,
      completionMessages,
      {
        onDelta: async (delta) => {
          assistantContent += delta;
          await writer.write({ type: 'text-delta', delta });
        },
      }
    );
    assistantContent = result.content || assistantContent;
    finishReason = result.finishReason;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Stream failed';
    if (assistantContent) {
      const partial = await insertChatMessage({
        threadId: thread.id,
        role: 'assistant',
        content: assistantContent,
        metadata: {
          model: config.minimaxChatModel,
          error: errorMessage,
        },
      });
      await writer.write({ type: 'assistant-end', message: partial });
    }
    await writer.write({ type: 'error', error: errorMessage });
    await writer.write({ type: 'done' });
    return;
  }

  const assistantMessage = await insertChatMessage({
    threadId: thread.id,
    role: 'assistant',
    content: assistantContent,
    metadata: {
      model: config.minimaxChatModel,
      finishReason,
    },
  });

  await touchThread(thread.id);
  await writer.write({ type: 'assistant-end', message: assistantMessage });

  if (isNewThread || thread.title === DEFAULT_THREAD_TITLE) {
    void generateThreadTitle(input.message)
      .then(async (title) => {
        await updateUserChatThreadTitle(userId, thread!.id, title);
      })
      .catch((error) => {
        console.warn('Failed to generate chat thread title:', error);
      });
  }

  await writer.write({ type: 'done' });
}
