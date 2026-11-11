-- Cookie health enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "CookieHealthStatus" AS ENUM ('UNKNOWN', 'ALIVE', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable Tool
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "allowedHosts" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "proxySubdomain" TEXT;

-- AlterTable ToolAccount
ALTER TABLE "ToolAccount" ADD COLUMN IF NOT EXISTS "healthStatus" "CookieHealthStatus" NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "ToolAccount" ADD COLUMN IF NOT EXISTS "lastHealthCheckAt" TIMESTAMP(3);
ALTER TABLE "ToolAccount" ADD COLUMN IF NOT EXISTS "lastHealthError" TEXT;

-- LaunchToken: replace plaintext token with SHA-256 hash.
-- Existing short-lived tokens are discarded (users re-click Launch).
DELETE FROM "LaunchToken";

DROP INDEX IF EXISTS "LaunchToken_token_key";
DROP INDEX IF EXISTS "LaunchToken_token_idx";
DROP INDEX IF EXISTS "LaunchToken_tokenHash_key";
DROP INDEX IF EXISTS "LaunchToken_tokenHash_idx";

ALTER TABLE "LaunchToken" DROP COLUMN IF EXISTS "token";
ALTER TABLE "LaunchToken" DROP COLUMN IF EXISTS "tokenHash";
ALTER TABLE "LaunchToken" ADD COLUMN "tokenHash" TEXT NOT NULL;

CREATE UNIQUE INDEX "LaunchToken_tokenHash_key" ON "LaunchToken"("tokenHash");
CREATE INDEX "LaunchToken_tokenHash_idx" ON "LaunchToken"("tokenHash");

-- CreateTable ProxySession
CREATE TABLE IF NOT EXISTS "ProxySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "toolAccountId" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "upstreamOrigin" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastAccessCheckAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProxySession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProxySession_toolAccountId_revokedAt_expiresAt_idx"
  ON "ProxySession"("toolAccountId", "revokedAt", "expiresAt");
CREATE INDEX IF NOT EXISTS "ProxySession_userId_toolId_idx"
  ON "ProxySession"("userId", "toolId");
CREATE INDEX IF NOT EXISTS "ProxySession_expiresAt_idx"
  ON "ProxySession"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProxySession_toolId_fkey'
  ) THEN
    ALTER TABLE "ProxySession"
      ADD CONSTRAINT "ProxySession_toolId_fkey"
      FOREIGN KEY ("toolId") REFERENCES "Tool"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProxySession_toolAccountId_fkey'
  ) THEN
    ALTER TABLE "ProxySession"
      ADD CONSTRAINT "ProxySession_toolAccountId_fkey"
      FOREIGN KEY ("toolAccountId") REFERENCES "ToolAccount"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
