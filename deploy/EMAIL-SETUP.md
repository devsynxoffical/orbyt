# Email setup for Rankmora / GroupBuy Tools (VPS)

Forgot-password emails are sent over **SMTP**. Your app already supports this via `.env` variables.

## Important: do not run your own mail server on IONOS

IONOS **blocks outbound SMTP port 25**. Self-hosting Postfix/Exim on the VPS is hard and usually fails deliverability (spam folders).

Use an **external email provider** and connect with SMTP on port **587** or **465**.

---

## Option A — Resend (recommended, free tier)

1. Create account: https://resend.com  
2. **API Keys** → create a key (starts with `re_`)  
3. For testing only (no domain yet): use `EMAIL_FROM=onboarding@resend.dev`  
   Resend will only deliver to **your Resend account email** until a domain is verified.  
4. For production: **Domains** → add `rankmora.io` → add SPF/DKIM in Namecheap → wait for **Verified**  
   Then set `EMAIL_FROM=noreply@rankmora.io`  
5. On the VPS:

```bash
cd /var/www/groupbuy-tools

# remove old email lines if any
sed -i '/^SMTP_/d;/^EMAIL_FROM/d' .env

cat >> .env << 'EOF'
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_YOUR_API_KEY_HERE
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=GroupBuy Tools
EOF

pm2 reload all --update-env
```

After `rankmora.io` is verified in Resend, change:

```bash
sed -i 's|^EMAIL_FROM=.*|EMAIL_FROM=noreply@rankmora.io|' .env
pm2 reload all --update-env
```

Use a verified sender like `noreply@rankmora.io` or `support@rankmora.io`.

---

## Option B — Namecheap Private Email

1. Namecheap → your domain → **Private Email** (or Email Hosting)  
2. Create mailbox e.g. `noreply@rankmora.io`  
3. SMTP settings (confirm in Namecheap docs):

| Setting | Typical value |
|---------|----------------|
| Host | `mail.privateemail.com` |
| Port | `587` |
| User | full email `noreply@rankmora.io` |
| Pass | mailbox password |
| Secure | false for 587 |

```bash
cd /var/www/groupbuy-tools
sed -i '/^SMTP_/d;/^EMAIL_FROM/d' .env

cat >> .env << 'EOF'
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@rankmora.io
SMTP_PASS=YOUR_MAILBOX_PASSWORD
EMAIL_FROM=noreply@rankmora.io
EMAIL_FROM_NAME=GroupBuy Tools
EOF

pm2 reload all --update-env
```

---

## Option C — Brevo / SendGrid / Gmail app password

Same pattern: copy their SMTP host/user/pass into the env vars above.

---

## DNS you should have (Namecheap)

Besides A records for the website, for good deliverability add what your provider gives you:

- **SPF** — TXT on `@`  
- **DKIM** — CNAME/TXT from provider  
- **DMARC** — TXT on `_dmarc` (optional but recommended)

Website A records stay pointing at `74.208.248.8`. Email DNS is separate and does **not** require mail to run on the VPS.

---

## Test forgot password

1. Open https://rankmora.io/forgot-password  
2. Enter a real user email  
3. Check inbox (and spam)  
4. Click the link → set new password → login  

If SMTP is missing, the server logs the reset URL (dev/local) and production returns a generic success message without sending.

---

## Deploy checklist after code pull

```bash
cd /var/www/groupbuy-tools
git pull origin master
npx prisma migrate deploy
./deploy/deploy-app.sh
```
