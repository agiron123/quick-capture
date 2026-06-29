# Quick Capture — TLS & deployment

**Status:** In progress (Phase 7)  
**Phase:** 7

## Overview

Phase 7 adds **trusted HTTPS** for Docker Compose dev (Let's Encrypt via Caddy) and documents a **Vercel-first** production path. API, whisper, and object storage hosts remain TBD.

## Local Docker TLS (7.1)

### Proxy choice: **Caddy**

Caddy is the default reverse proxy — built-in ACME, automatic HTTP-01, cert persistence in a Docker volume.

```
Browser → Caddy :443 (Let's Encrypt)
            ├─→ https://${DEV_DOMAIN}      → web:3001 (HTTP inside compose)
            └─→ https://api.${DEV_DOMAIN}  → api:3000
```

Default `npm run docker:dev` is unchanged (self-signed `https://localhost:3001`). TLS mode is opt-in:

```bash
# .env — real domain pointing at this machine (DNS or tunnel)
DEV_DOMAIN=dev.quickcapture.example.com
ACME_EMAIL=you@example.com
CORS_ORIGINS=https://dev.quickcapture.example.com,https://api.dev.quickcapture.example.com,http://localhost:8081
NEXT_PUBLIC_API_URL=https://api.dev.quickcapture.example.com

npm run docker:dev:tls
```

### Requirements

- **Public DNS** (or Cloudflare Tunnel / Tailscale Funnel) — Let's Encrypt cannot issue for `localhost`
- Ports **80** and **443** reachable from the internet (HTTP-01 challenge)
- **Neon Auth** — add `https://${DEV_DOMAIN}` and `https://api.${DEV_DOMAIN}` to allowed origins + OAuth redirect URIs ([auth.md](./auth.md))

### Renewal

Caddy waits for healthy **web** and **api** before accepting traffic. The TLS stack adds healthchecks on all three services (Node `fetch` for app containers, `wget` for Caddy on port 80).

Default localhost stack: **web** waits for healthy **api**; **api** waits for healthy **whisper**.

### Offline / localhost fallback

Use default `npm run docker:dev` with self-signed certs, or [Portless](worktree-dev.md) / worktree port offsets.

## Production (7.3 — planned)

| Component | Target |
| --- | --- |
| Web | Vercel |
| Neon Postgres + Auth | Neon |
| API | TBD (Railway, Fly, VPS, or Vercel Functions — validate SSE/uploads) |
| whisper.cpp | Separate container or managed STT |
| Capture storage | R2/S3 (already supported) |

See [PLAN.md](../../PLAN.md) Phase 7.3 for open decisions.

## Related

- [docker-dev.md](../docker-dev.md)
- [auth.md](./auth.md)
- [worktree-dev.md](./worktree-dev.md)
