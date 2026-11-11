-- Align legacy init schema with current Prisma models

-- Tool: pricing and visibility
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "pricePkr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

-- Plan: PKR pricing instead of Stripe cents
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "pricePkr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "durationDays" INTEGER NOT NULL DEFAULT 30;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Plan' AND column_name = 'priceCents'
  ) THEN
    UPDATE "Plan" SET "pricePkr" = "priceCents" WHERE "pricePkr" = 0;
  END IF;
END $$;

ALTER TABLE "Plan" DROP COLUMN IF EXISTS "priceCents";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "interval";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "stripePriceId";

DROP INDEX IF EXISTS "Plan_stripePriceId_key";

-- Subscription: manual billing fields instead of Stripe
ALTER TYPE "SubStatus" ADD VALUE IF NOT EXISTS 'PENDING';

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "notes" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Subscription' AND column_name = 'currentPeriodEnd'
  ) THEN
    UPDATE "Subscription"
    SET "expiresAt" = "currentPeriodEnd"
    WHERE "expiresAt" IS NULL;
  END IF;
END $$;

ALTER TABLE "Subscription" ALTER COLUMN "planId" DROP NOT NULL;
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripeSubId";
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "currentPeriodEnd";

DROP INDEX IF EXISTS "Subscription_stripeSubId_key";

-- Remove unused Stripe payment table from legacy init
DROP TABLE IF EXISTS "Payment";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "BillingInterval";

-- PlatformSettings.updatedAt default for existing rows
UPDATE "PlatformSettings" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;
