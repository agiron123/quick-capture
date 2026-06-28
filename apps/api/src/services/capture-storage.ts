import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultStorageDir = path.resolve(currentDir, '../../../.uploads');

function getStorageDir(): string {
  return process.env.CAPTURE_STORAGE_DIR?.trim() || defaultStorageDir;
}

export async function saveCaptureMedia(
  userId: string,
  captureId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mediaKey = path.join(userId, captureId);
  const absolutePath = path.join(getStorageDir(), mediaKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return JSON.stringify({ path: mediaKey, mimeType });
}

export async function readCaptureMedia(mediaKey: string): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  try {
    const parsed = JSON.parse(mediaKey) as { path: string; mimeType: string };
    const absolutePath = path.join(getStorageDir(), parsed.path);
    const buffer = await readFile(absolutePath);
    return { buffer, mimeType: parsed.mimeType || 'application/octet-stream' };
  } catch {
    return null;
  }
}
