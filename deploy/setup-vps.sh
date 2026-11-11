#!/usr/bin/env bash
# GroupBuy Tools — VPS bootstrap (Ubuntu 22.04 / 24.04)
# Run as root or with sudo on a fresh VPS.
#
# Usage:
#   curl -fsSL ... | bash   OR   chmod +x deploy/setup-vps.sh && sudo ./deploy/setup-vps.sh
#
# After this script: clone repo, configure .env, run deploy/deploy-app.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/groupbuy-tools}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "==> Installing system packages..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw

echo "==> Installing Node.js ${NODE_MAJOR}..."
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Creating app directory ${APP_DIR}..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/public/uploads/payments"
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "$APP_DIR" 2>/dev/null || true

echo "==> Firewall (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> PM2 startup on boot..."
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "${SUDO_USER:-root}" --hp "/home/${SUDO_USER:-root}" || true

cat <<EOF

============================================================
 VPS base setup complete.
============================================================

Next steps:

  1. Clone or upload the app:
     git clone <your-repo-url> ${APP_DIR}
     cd ${APP_DIR}

  2. Create production env:
     cp deploy/env.production.example .env
     nano .env   # fill DATABASE_URL, domains, secrets

  3. Deploy the app:
     chmod +x deploy/deploy-app.sh
     ./deploy/deploy-app.sh

  4. Configure Nginx:
     sed 's/APP_DOMAIN/your-app.com/g; s/SESSION_DOMAIN/session.your-app.com/g' \\
       deploy/nginx/groupbuy.conf.template | sudo tee /etc/nginx/sites-available/groupbuy
     sudo ln -sf /etc/nginx/sites-available/groupbuy /etc/nginx/sites-enabled/
     sudo rm -f /etc/nginx/sites-enabled/default
     sudo nginx -t && sudo systemctl reload nginx

  5. SSL certificates:
     sudo certbot --nginx -d your-app.com -d session.your-app.com

  6. Save PM2 process list:
     pm2 save

Health checks:
  curl -s https://your-app.com
  curl -s https://session.your-app.com/health

EOF
