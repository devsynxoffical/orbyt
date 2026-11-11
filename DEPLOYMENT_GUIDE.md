# Orbyt Rush — Railway Production Deployment Guide

This guide walks you through deploying **Orbyt Rush** live on [Railway](https://railway.com) with a managed PostgreSQL database, automated database migrations, and production authentication.

---

## 1. Which Database to Connect?

Use **Railway's managed PostgreSQL**:
* **Database Type**: **PostgreSQL** (version 15 or 16).
* In Railway, you provision this with 1 click directly inside your project (`+ New` → `Database` → `Add PostgreSQL`).
* Railway automatically manages backups, persistence, and gives you a private internal connection URL (`${{Postgres.DATABASE_URL}}`).

---

## 2. Environment Variables Required on Railway

Go to your web service in Railway → **Variables** tab → **RAW Editor** (or Add Variable):

| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connects your app to the Railway Postgres database | `${{Postgres.DATABASE_URL}}` |
| `NEXTAUTH_URL` | Your live website URL (protocol + domain) | `https://${{RAILWAY_PUBLIC_DOMAIN}}` or `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | 32+ character random encryption key | Run `openssl rand -base64 32` |
| `SESSION_ENCRYPTION_KEY` | 32+ character random key for encrypting tool cookies | Run `openssl rand -base64 32` |
| `USE_MOCK_DATA` | Disables demo data and connects to the live database | `false` |
| `NODE_ENV` | Sets production mode | `production` |

### Optional Variables (Payment & Features)
* `NEXT_PUBLIC_APP_URL`: Same as `NEXTAUTH_URL` (e.g. `https://yourdomain.com`).
* `STRIPE_SECRET_KEY`: `sk_live_...` (for card payments).
* `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
* `STRIPE_WEBHOOK_SECRET`: `whsec_...`

---

## 3. Step-by-Step Deployment Options

### Method A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Orbyt Rush for Railway deployment"
   git push origin main
   ```

2. **Create Project on Railway**:
   * Log into [Railway](https://railway.com).
   * Click **"+ New Project"** → **"Deploy from GitHub repo"**.
   * Select your `orby` repository.

3. **Add PostgreSQL Database**:
   * In the Railway project canvas, click **"+ New"** (top right).
   * Select **"Database"** → **"Add PostgreSQL"**.
   * Railway will spin up the database in seconds.

4. **Add Environment Variables**:
   * Click on your **Web Service** card (your app).
   * Click on the **"Variables"** tab.
   * Add:
     * `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
     * `NEXTAUTH_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}`
     * `NEXTAUTH_SECRET` = *(Generate with: `openssl rand -base64 32`)*
     * `SESSION_ENCRYPTION_KEY` = *(Generate with: `openssl rand -base64 32`)*
     * `USE_MOCK_DATA` = `false`
     * `NODE_ENV` = `production`

5. **Generate a Public Domain**:
   * Under your Web Service, go to **"Settings"** → **"Networking"**.
   * Click **"Generate Domain"** (or add your custom domain, e.g. `app.yourdomain.com`).

6. **Seed Initial Admin Account & Data**:
   * Once deployed, click the Web Service → **"Deployments"** → open the command/terminal tab (or use Railway CLI):
   * Run the seed script:
     ```bash
     npx tsx prisma/seed.ts
     ```
   * **Default Seed Admin Login**:
     * **Email**: `admin@platform.com`
     * **Password**: `Admin@1234`
     *(Change this password immediately under Admin → Settings).*

---

### Method B: Deploy via Railway CLI

If you prefer using your terminal directly:

1. **Sign in to Railway**:
   ```bash
   railway login
   ```

2. **Initialize project and link**:
   ```bash
   railway init
   ```

3. **Add PostgreSQL**:
   ```bash
   railway add -d postgres
   ```

4. **Set environment variables**:
   ```bash
   railway variables set USE_MOCK_DATA=false
   railway variables set NODE_ENV=production
   railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
   railway variables set SESSION_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

5. **Deploy the code**:
   ```bash
   railway up
   ```

6. **Generate domain**:
   ```bash
   railway domain
   ```

7. **Seed the database**:
   ```bash
   railway run npx tsx prisma/seed.ts
   ```

---

## 4. How the Railway Build Works

A [`railway.json`](file:///Users/hassan/Devsynx-projects/orby/railway.json) file has been configured at the repository root:
* **Builder**: Nixpacks (automatically detects Node 20/22, installs packages, and runs `npm run build`).
* **Start Command**: `npx prisma migrate deploy && next start` (automatically applies all database migrations to your Railway PostgreSQL database on every deployment before the web server boots).
* **Health Check**: `/api/health` (Railway polls this endpoint to verify database connectivity and ensure zero-downtime rollouts).

