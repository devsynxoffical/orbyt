# Production activation checklist

Use this after deploying to the VPS to verify every feature works.

## 1. Environment (`.env`)

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase pooler URL with `connection_limit=1` |
| `NEXTAUTH_URL` | `https://rankmora.io` |
| `NEXTAUTH_SECRET` | random 32+ chars |
| `SESSION_ENCRYPTION_KEY` | random 32+ chars (same on web + session) |
| `SESSION_SERVICE_API_KEY` | random string |
| `SESSION_SERVICE_URL` | `http://127.0.0.1:4000` |
| `SESSION_SERVICE_PUBLIC_URL` | `https://session.rankmora.io` |
| `SESSION_TOOLS_BASE_DOMAIN` | `tools.rankmora.io` (optional, enables `semrush.tools…`) |
| `USE_MOCK_DATA` | unset or `false` |

## 2. Database migration

```bash
cd /var/www/groupbuy-tools
git pull origin master
npx prisma migrate deploy
```

This applies `session_proxy_hardening` (cookie health, hashed launch tokens, ProxySession).

## 3. Deploy

```bash
SKIP_SEED=1 ./deploy/deploy-app.sh
# Update Nginx from deploy/nginx/groupbuy.conf.template
# Replace APP_DOMAIN / ADMIN_DOMAIN / SESSION_DOMAIN / TOOLS_BASE_DOMAIN
nginx -t && systemctl reload nginx
pm2 restart ecosystem.config.js
```

Health checks should return HTTP 200:
- `curl http://127.0.0.1:3000/api/health`
- `curl http://127.0.0.1:4000/health`

## 4. Wildcard DNS + TLS (per-tool hosts)

1. Namecheap DNS: `A` record host `*.tools` → VPS IP (and `tools` apex if desired).
2. Issue wildcard cert (DNS-01):
   ```bash
   sudo certbot certonly --manual --preferred-challenges dns \
     -d tools.rankmora.io -d "*.tools.rankmora.io"
   ```
3. Set in `.env`:
   ```
   SESSION_TOOLS_BASE_DOMAIN=tools.rankmora.io
   SESSION_SERVICE_PUBLIC_URL=https://session.rankmora.io
   ```
4. Restart `groupbuy-session`.

Without wildcard DNS, leave `SESSION_TOOLS_BASE_DOMAIN` empty and launches stay on `SESSION_SERVICE_PUBLIC_URL/go/...`.

## 5. Admin setup

1. **Tools** — set HTTPS Launch URL for each tool (validated + host allowlisted).
2. **Tool accounts** — paste cookie JSON → **Test session** → status must show **Alive**.
3. Keep Max concurrent users low (1–3 recommended).
4. When status shows **Expired**, export fresh cookies and Test again (do not store passwords).

## 6. End-to-end smoke tests

### Launch tool
- [ ] User with ACTIVE access clicks Launch
- [ ] Redirect goes to session/tool host `/go/{token}`
- [ ] Cookie `gb_proxy` is HttpOnly (Secure on HTTPS)
- [ ] Tool opens under `/proxy/{slug}/` or `slug.tools…`
- [ ] Suspend user mid-session → next proxy request shows access revoked
- [ ] Fill all seats → next launch returns capacity error (not silent overload)

### Cookie health
- [ ] Test session → Alive on a fresh export
- [ ] Clear cookies / use dead jar → Expired or Unknown with safe message

## 7. Known limitations

- Modern vendors may block reverse proxies (CSP, MFA, anti-abuse). Failures are shown as Expired/Unknown — we do not bypass vendor controls.
- Automated cookie refresh is **out of scope**; admin refreshes sessions manually.
- Session service listens on `127.0.0.1:4000` only — expose via Nginx, not the open internet.
- Payment screenshots live in `public/uploads/payments/`.
