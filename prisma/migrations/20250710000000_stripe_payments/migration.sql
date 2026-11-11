-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL', 'STRIPE');

-- AlterTable
ALTER TABLE "PaymentOrder" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "PaymentOrder" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "PaymentOrder" ALTER COLUMN "bankAccountId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_stripeSessionId_key" ON "PaymentOrder"("stripeSessionId");
