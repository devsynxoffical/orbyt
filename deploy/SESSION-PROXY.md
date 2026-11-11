# Session proxy rollout

Hardened cookie/session reverse proxy for GroupBuy Tools.

## What changed

- Encrypted cookie accounts with **Alive / Expired / Unknown** health checks
- Hashed one-time launch tokens (atomic consume)
- Persistent `ProxySession` rows with mid-session access re-check + revoke
- Hard concurrent-user limits (no silent overload)
- HTTPS upstream allowlists + private IP blocking
- Multi-method proxy + same-host `Location` rewrite
- Optional per-tool hosts: `semrush.tools.yourdomain.com`
- Session service listens on `127.0.0.1` only

## VPS commands

```bash
cd /var/www/groupbuy-tools
git pull origin master
npx prisma migrate deploy
npm install
npm install --prefix apps/session-service
npx prisma generate
npm run build
pm2 restart ecosystem.config.js
```

Launch modes (PROXY / EXTENSION / DIRECT / mobile): see `deploy/LAUNCH-MODES.md`.

If `/dashboard` shows “Application error”, the database is usually behind the code — run `npx prisma migrate deploy` and check `pm2 logs groupbuy-web --lines 40`.

`prisma generate` writes clients into:
- `node_modules/@prisma/client` (Next.js)
- `apps/session-service/node_modules/.prisma/client` (session service)

If you skip generate, the session service can crash with “@prisma/client did not initialize yet” or missing `proxySession`.

Add to `.env` (see `deploy/env.production.example`):

```
SESSION_SERVICE_URL=http://127.0.0.1:4000
SESSION_SERVICE_PUBLIC_URL=https://session.rankmora.io
SESSION_TOOLS_BASE_DOMAIN=tools.rankmora.io
SESSION_SERVICE_API_KEY=...
SESSION_ENCRYPTION_KEY=...
```

DNS: `A` record `*.tools` → VPS. TLS: wildcard cert via DNS-01 (see `PRODUCTION-CHECKLIST.md`).

Path-based launches (`session.yourdomain.com/proxy/:slug/...`) also keep working when a
vendor SPA navigates to absolute paths like `/dashboard` or `/api/...` — the session
service reuses the `gb_proxy` cookie and continues proxying. Prefer `*.tools` hosts when
you can; path fallback covers tools that rewrite the URL bar.

## Railway (full move off VPS)

Moving only the Next.js site is not enough — **tool Launch needs `apps/session-service`**.

1. Keep **TOOLS** (Next.js) on Railway with domain `rankmora.io`.
2. Add a second service **SESSION** from the same repo:
   - Build: `npm install && npm install --prefix apps/session-service && npx prisma generate`
   - Start: `npm run session:start`
   - Domain: `session.rankmora.io`
   - Env: see `deploy/env.railway.example` (SESSION section) + shared `DATABASE_URL` / keys
3. On **TOOLS** set:
   - `SESSION_SERVICE_URL=https://session.rankmora.io`
   - `SESSION_SERVICE_PUBLIC_URL=https://session.rankmora.io`
4. Same `SESSION_SERVICE_API_KEY` + `SESSION_ENCRYPTION_KEY` on both services.

Optional template: `deploy/railway.session.toml`.

## Railway + VPS hybrid

If Next.js runs on Railway and the cookie proxy stays on the VPS:

1. Copy `deploy/env.railway.example` into Railway → TOOLS → Variables → Raw Editor.
2. Set `SESSION_SERVICE_URL` / `SESSION_SERVICE_PUBLIC_URL` to `https://session.rankmora.io`
   (not `localhost`).
3. Use the **same** `SESSION_SERVICE_API_KEY` and `SESSION_ENCRYPTION_KEY` as the VPS.
4. Point Railway `DATABASE_URL` at Railway Postgres; set the VPS `.env` `DATABASE_URL` to
   the same DB (public proxy URL) and `pm2 restart groupbuy-session --update-env`.
5. DNS: `rankmora.io` → Railway; `session.rankmora.io` (+ `*.tools`) → VPS.

## Admin ops

1. Set tool Launch URL (HTTPS).
2. Paste cookies → **Test session**.
3. Launch only when status is **Alive**.
4. Refresh cookies when **Expired**.
5. Keep max concurrent users low.

Compatibility is best-effort per vendor. Do not store passwords.
