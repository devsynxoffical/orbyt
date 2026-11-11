# GroupBuy Tools

Premium SEO tools platform — public marketing site, user dashboard, admin panel, Stripe subscriptions, and automated tool access.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **NextAuth.js** (email/password credentials)
- **PostgreSQL** via Supabase + **Prisma** ORM
- **Stripe** (Milestone 2)
- **React Hook Form** + **Zod**

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — your Supabase PostgreSQL connection string
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`

3. **Run database migrations and seed**

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Milestone 1 — What's Included

- Design system (brand colors, Inter font, component rules)
- Public pages: Home, Pricing, About, Contact, Legal
- Auth: Signup, Login (NextAuth credentials + bcrypt)
- Route protection middleware for `/dashboard/*` and `/admin/*`
- Empty dashboard shell after login
- Prisma schema + seed data (3 plans, 6 tools)

## Project Structure

```
app/
  (marketing)/     # Public site with Navbar + Footer
  (auth)/          # Login & Signup
  dashboard/       # User dashboard (Milestone 1 shell)
  api/auth/        # NextAuth + signup endpoint
components/        # Reusable UI components
lib/               # Prisma client, auth config, validations
prisma/            # Schema, migrations, seed
```

## Demo Flow (Milestone 1)

1. Visit homepage → browse pricing
2. Sign up with name, email, password
3. Log in → redirected to `/dashboard` (empty state)
4. Unauthenticated users cannot access `/dashboard`

## VPS deployment

Two domains recommended:

| Domain | Service | Port |
|--------|---------|------|
| `app.yoursite.com` | Next.js (site + admin) | 3000 |
| `session.yoursite.com` | Session proxy (tool launch) | 4000 |

### Quick deploy (Ubuntu VPS)

```bash
# 1. On VPS — base setup (Node, Nginx, PM2, firewall)
sudo bash deploy/setup-vps.sh

# 2. Clone app to /var/www/groupbuy-tools and configure env
cp deploy/env.production.example .env
nano .env

# 3. Build, migrate, start
./deploy/deploy-app.sh

# 4. Nginx + SSL (replace domains)
sudo certbot --nginx -d app.yoursite.com -d session.yoursite.com
```

See `deploy/nginx/groupbuy.conf.template` and `deploy/env.production.example` for full config.

### Production checklist

- [ ] `DATABASE_URL` set (Supabase or Postgres on VPS)
- [ ] `NEXTAUTH_URL` = `https://app.yoursite.com`
- [ ] `SESSION_SERVICE_PUBLIC_URL` = `https://session.yoursite.com`
- [ ] `SESSION_SERVICE_URL` = `http://127.0.0.1:4000` (internal only)
- [ ] Strong `NEXTAUTH_SECRET`, `SESSION_ENCRYPTION_KEY`, `SESSION_SERVICE_API_KEY`
- [ ] Admin: bank accounts, tool prices, launch URLs, cookie accounts
- [ ] `pm2 save` after first start

## License

Private — Ahmad Safdar / GroupBuy Tools
