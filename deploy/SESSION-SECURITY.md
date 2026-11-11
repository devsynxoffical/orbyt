# Account / login security

Rankmora enforces **one active login per user** and optional **IP binding** so shared passwords cannot stay open on multiple phones or networks at once.

## What we enforce

| Rule | Behavior |
|------|----------|
| Single session | Each new login bumps `User.sessionVersion` and **kicks all other devices** within ~1 minute (or immediately on next dashboard/API hit) |
| IP bind (users) | Login IP is stored in the JWT. If the IP changes mid-session → forced re-login (`?error=ipChanged`) |
| Session lifetime | Default **12 hours** (`AUTH_SESSION_MAX_AGE_SEC`) then must sign in again |
| Suspend | Admin suspend bumps `sessionVersion` + revokes tool proxy seats |
| Password change / reset | Bumps `sessionVersion` → old sessions die |
| Failed login lockout | After **5** wrong passwords (`AUTH_MAX_FAILED_LOGINS`) status → **LOCKED**; only admin **Unblock** restores access |
| Login session log | Every success/fail login stored (IP, device, time) on **Admin → Users → [user]** |
| Suspicious email | New IP / device emails the user (requires SMTP). Optional copy to `SECURITY_ALERT_EMAIL` |

Admins are **not** IP-bound by default (`AUTH_STRICT_IP_ADMIN=false`) so office/VPN switches do not lock you out.

## Admin controls (Users)

- **Unblock** → `ACTIVE` (clears failed-login counter)
- **Suspend** → `SUSPENDED` (policy ban)
- **Block** → `LOCKED` (same as auto lockout)
- **Login sessions** table + distinct IP count on each user detail page

Filter users by Active / Locked / Suspended.

## Env (production `.env`)

```bash
AUTH_SESSION_MAX_AGE_SEC=43200
AUTH_SESSION_UPDATE_AGE_SEC=60
AUTH_STRICT_IP=true
AUTH_STRICT_IP_ADMIN=false
AUTH_MAX_FAILED_LOGINS=5
SECURITY_ALERT_EMAIL=admin@rankmora.io
# SMTP required for alerts — see deploy/EMAIL-SETUP.md
```

Set `AUTH_STRICT_IP=false` only if legitimate users on flaky mobile networks get kicked too often — single-session still applies.

## Deploy

```bash
cd /var/www/groupbuy-tools
git pull origin master
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart groupbuy-web --update-env
```

## User-facing messages

- `sessionTaken` — signed in elsewhere  
- `ipChanged` — network/IP changed  
- `sessionExpired` — session invalid / suspended token  

## Note

This protects **Rankmora account login**. Tool-account seat limits (Semrush cookies shared by N users) remain separate via `ToolAccount.maxConcurrentUsers` / ProxySession.
