# Cloud browser (removed)

The remote Chromium / mobile cloud session path was **removed** from Rankmora.

Canva and other Cloudflare-protected tools use the **desktop Chrome extension** only.
See `deploy/LAUNCH-MODES.md`.

On the VPS, stop and delete the old process if it is still running:

```bash
pm2 stop groupbuy-cloud
pm2 delete groupbuy-cloud
pm2 save
# Optional: remove CLOUD_BROWSER_* lines from /var/www/groupbuy-tools/.env
```

The `apps/cloud-browser` folder may remain in the repo unused; it is not started by PM2.
