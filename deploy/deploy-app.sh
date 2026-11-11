#!/usr/bin/env bash
# Deploy / update GroupBuy Tools on the VPS.
# Run from the project root (e.g. /var/www/groupbuy-tools).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Copy deploy/env.production.example to .env first."
  exit 1
fi

echo "==> Ensuring upload directories..."
mkdir -p public/uploads/payments
chmod 755 public/uploads/payments

echo "==> Installing dependencies..."
npm ci
npm run session:install

echo "==> Prisma generate + migrate..."
npx prisma generate
npx prisma migrate deploy

if [[ "${SKIP_SEED:-}" != "1" ]]; then
  echo "==> Seeding database (set SKIP_SEED=1 to skip)..."
  npm run db:seed || echo "Seed skipped or already applied."
fi

echo "==> Building Next.js..."
npm run build

echo "==> Restarting PM2..."
if pm2 describe groupbuy-web &>/dev/null; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "==> Health checks (waiting for services to start)..."

wait_for_http() {
  local url="$1"
  local name="$2"
  local attempts="${3:-30}"
  local code="000"

  for ((i = 1; i <= attempts; i++)); do
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)"
    if [[ "$code" == "200" ]]; then
      echo "  ${name}: HTTP ${code}"
      return 0
    fi
    sleep 2
  done

  echo "  ${name}: HTTP ${code}"
  return 1
}

WEB_OK=0
SESSION_OK=0
wait_for_http "http://127.0.0.1:3000/api/health" "groupbuy-web" || WEB_OK=1
wait_for_http "http://127.0.0.1:4000/health" "groupbuy-session" || SESSION_OK=1

if [[ "$WEB_OK" != "0" ]]; then
  echo "WARN: Web app health check failed. Run: pm2 logs groupbuy-web --lines 50"
fi
if [[ "$SESSION_OK" != "0" ]]; then
  echo "WARN: Session service health check failed. Run: pm2 logs groupbuy-session --lines 50"
fi

echo ""
echo "Deploy complete."
pm2 status
