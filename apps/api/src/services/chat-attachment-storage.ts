import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readCaptureMedia, saveCaptureMedia } from './capture-storage.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultStorageDir = path.resolve(currentDir, '../../../.uploads');

type ChatAttachmentIndex = {
  mediaKey: string;
  mimeType: string;
};

function getLocalStorageDir(): string {
  return process.env.CAPTURE_STORAGE_DIR?.trim() || defaultStorageDir;
}

function indexPath(userId: string, attachmentId: string): string {
  return path.join(getLocalStorageDir(), userId, 'chat-index', `${attachmentId}.json`);
}

export async function saveChatAttachment(
  userId: string,
  attachmentId: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const mediaKey = await saveCaptureMedia(userId, `chat/${attachmentId}`, buffer, mimeType);
  const indexFile = indexPath(userId, attachmentId);
  await mkdir(path.dirname(indexFile), { recursive: true });
  await writeFile(
    indexFile,
    JSON.stringify({ mediaKey, mimeType } satisfies ChatAttachmentIndex),
    'utf8'
  );
}

export async function readChatAttachment(
  userId: string,
  attachmentId: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  let index: ChatAttachmentIndex;
  try {
    index = JSON.parse(await readFile(indexPath(userId, attachmentId), 'utf8')) as ChatAttachmentIndex;
  } catch {
    return null;
  }

  const media = await readCaptureMedia(index.mediaKey);
  if (!media) return null;

  return {
    buffer: media.buffer,
    mimeType: index.mimeType || media.mimeType,
  };
}
