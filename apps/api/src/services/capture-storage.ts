import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultStorageDir = path.resolve(currentDir, '../../../.uploads');

type StoredMediaKey = {
  provider?: 'local' | 's3';
  path?: string;
  key?: string;
  mimeType: string;
};

function getStorageProvider(): 'local' | 's3' {
  const provider = process.env.CAPTURE_STORAGE_PROVIDER?.trim().toLowerCase();
  if (provider === 's3' || provider === 'r2') {
    return 's3';
  }
  return 'local';
}

function getLocalStorageDir(): string {
  return process.env.CAPTURE_STORAGE_DIR?.trim() || defaultStorageDir;
}

function parseMediaKey(mediaKey: string): StoredMediaKey | null {
  try {
    return JSON.parse(mediaKey) as StoredMediaKey;
  } catch {
    return null;
  }
}

function isS3MediaKey(parsed: StoredMediaKey): boolean {
  return parsed.provider === 's3' || Boolean(parsed.key);
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;

  const endpoint = process.env.CAPTURE_STORAGE_ENDPOINT?.trim();
  const accessKeyId = process.env.CAPTURE_STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.CAPTURE_STORAGE_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3/R2 capture storage is not configured (set CAPTURE_STORAGE_ENDPOINT and credentials)'
    );
  }

  s3Client = new S3Client({
    region: process.env.CAPTURE_STORAGE_REGION?.trim() || 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

function getS3Bucket(): string {
  const bucket = process.env.CAPTURE_STORAGE_BUCKET?.trim();
  if (!bucket) {
    throw new Error('CAPTURE_STORAGE_BUCKET is required when using S3/R2 capture storage');
  }
  return bucket;
}

async function saveLocalCaptureMedia(
  userId: string,
  captureId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const relativePath = path.join(userId, captureId);
  const absolutePath = path.join(getLocalStorageDir(), relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return JSON.stringify({ provider: 'local', path: relativePath, mimeType });
}

async function readLocalCaptureMedia(parsed: StoredMediaKey): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  if (!parsed.path) return null;

  try {
    const absolutePath = path.join(getLocalStorageDir(), parsed.path);
    const buffer = await readFile(absolutePath);
    return { buffer, mimeType: parsed.mimeType || 'application/octet-stream' };
  } catch {
    return null;
  }
}

async function saveS3CaptureMedia(
  userId: string,
  captureId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const objectKey = `${userId}/${captureId}`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return JSON.stringify({ provider: 's3', key: objectKey, mimeType });
}

async function readS3CaptureMedia(parsed: StoredMediaKey): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  if (!parsed.key) return null;

  try {
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: getS3Bucket(),
        Key: parsed.key,
      })
    );

    if (!response.Body) return null;

    const bytes = await response.Body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      mimeType: parsed.mimeType || response.ContentType || 'application/octet-stream',
    };
  } catch {
    return null;
  }
}

export async function saveCaptureMedia(
  userId: string,
  captureId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (getStorageProvider() === 's3') {
    return saveS3CaptureMedia(userId, captureId, buffer, mimeType);
  }
  return saveLocalCaptureMedia(userId, captureId, buffer, mimeType);
}

export async function readCaptureMedia(mediaKey: string): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  const parsed = parseMediaKey(mediaKey);
  if (!parsed) return null;

  if (isS3MediaKey(parsed)) {
    return readS3CaptureMedia(parsed);
  }

  return readLocalCaptureMedia(parsed);
}

export function getCaptureStorageProvider(): 'local' | 's3' {
  return getStorageProvider();
}
