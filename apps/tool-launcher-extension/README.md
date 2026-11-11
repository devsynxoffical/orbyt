# Rankmora Tool Launcher (Chrome extension)

Canva and other Cloudflare-protected sites **cannot** be reverse-proxied. This extension sets authorized session cookies on the **real** tool domain in the user’s browser.

## Install (users)

1. Log in at Rankmora → **Dashboard → Tool launcher**
2. Click **Download for Chrome** and follow the 5 steps (unzip → `chrome://extensions` → Load unpacked)
3. Click **Launch tool** on Canva and similar tools

### Mobile phones / tablets

- **PROXY tools** (Semrush, Moz, …): Launch works on phone (same-tab open).
- **EXTENSION tools** (Canva, …): **Desktop Chrome only** — phones show a clear CTA to install the Rankmora launcher on a computer.
- Chrome extensions **cannot** be installed on iOS/Android browsers.

Admins: run `npm run extension:pack` before deploy (also runs automatically on `npm run build`).

## Install (admin / manual)

1. On your Mac/PC, download the folder from the server or git repo:
   `apps/tool-launcher-extension/`
2. Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select `tool-launcher-extension`
5. Keep the extension enabled

## Use

1. Admin: Canva tool → Launch mode = **Browser extension**
2. Admin: Launch URL = `https://www.canva.com/` (match where you are logged in)
3. Export cookies from Chrome while logged into Canva:
   - DevTools → Application → Cookies → `https://www.canva.com`
   - Or use a “Export as JSON” extension (must include `domain`, `path`, `secure`, `httpOnly`, `sameSite`, `expirationDate`)
4. Admin: paste JSON → **Test session** → **Alive**
5. User: same Chrome profile with this extension → Rankmora dashboard → **Launch tool**

After updating the extension folder, open `chrome://extensions` and click **Reload** on Rankmora Tool Launcher.

If the tab opens but you are not logged in, check the dashboard message for `Applied X/Y session cookies`. If X is much smaller than Y, re-export cookies or disable ad/cookie blockers for `canva.com`.

## Deploy note

After pulling code on the VPS:

```bash
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart groupbuy-web
```

Users install the extension on their own computers (not on the VPS).
