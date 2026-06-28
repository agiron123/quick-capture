# Capture media storage

**Status:** Shipped  
**Phase:** 3

## Problem

Capture uploads (photos, voice recordings) need durable storage. Local disk works for development but not for production on Railway (ephemeral filesystem).

## Solution

`apps/api` supports two storage backends via `CAPTURE_STORAGE_PROVIDER`:

| Provider | Use case |
| --- | --- |
| `local` (default) | Development — files under `.uploads/` or `CAPTURE_STORAGE_DIR` |
| `s3` / `r2` | Production — S3-compatible object storage (Cloudflare R2, AWS S3, MinIO) |

The `media_key` column in `captures` stores a JSON descriptor:

```json
{ "provider": "local", "path": "userId/captureId", "mimeType": "image/jpeg" }
{ "provider": "s3", "key": "userId/captureId", "mimeType": "audio/m4a" }
```

Legacy rows without `provider` are read from local disk (backward compatible).

## Cloudflare R2 setup

1. Create an R2 bucket in Cloudflare dashboard.
2. Create API token with Object Read & Write on that bucket.
3. Set env vars on Railway:

```bash
CAPTURE_STORAGE_PROVIDER=r2
CAPTURE_STORAGE_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
CAPTURE_STORAGE_BUCKET=quick-capture
CAPTURE_STORAGE_ACCESS_KEY_ID=
CAPTURE_STORAGE_SECRET_ACCESS_KEY=
CAPTURE_STORAGE_REGION=auto
```

4. Deploy API — new uploads go to R2; `GET /api/captures/:id/media` streams from R2.

## API

| Endpoint | Purpose |
| --- | --- |
| `POST /api/captures/upload` | Multipart upload; saves media via configured provider |
| `GET /api/captures/:id/media` | Streams media for authenticated user |

Implementation: `apps/api/src/services/capture-storage.ts`

## Related

- [web-app.md](./web-app.md) — web capture upload
- [camera-capture.md](./camera-capture.md)
- [voice-capture.md](./voice-capture.md)
- [architecture.md](../architecture.md)
