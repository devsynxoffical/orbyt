const path = require("path");
const fs = require("fs");

// Load .env from project root so PM2 picks up DATABASE_URL, secrets, etc.
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const sharedEnv = {
  NODE_ENV: "production",
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  SESSION_ENCRYPTION_KEY: process.env.SESSION_ENCRYPTION_KEY,
  SESSION_SERVICE_API_KEY: process.env.SESSION_SERVICE_API_KEY,
  SESSION_SERVICE_URL: process.env.SESSION_SERVICE_URL || "http://127.0.0.1:4000",
  SESSION_SERVICE_PUBLIC_URL: process.env.SESSION_SERVICE_PUBLIC_URL,
  SESSION_SERVICE_PORT: process.env.SESSION_SERVICE_PORT || "4000",
  SESSION_TOOLS_BASE_DOMAIN: process.env.SESSION_TOOLS_BASE_DOMAIN,
  SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
};

module.exports = {
  apps: [
    {
      name: "groupbuy-web",
      cwd: __dirname,
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        ...sharedEnv,
        PORT: process.env.PORT || "3000",
      },
    },
    {
      name: "groupbuy-session",
      cwd: path.join(__dirname, "apps/session-service"),
      script: "npx",
      args: "tsx src/index.ts",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: sharedEnv,
    },
  ],
};
