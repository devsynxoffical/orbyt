-- CreateEnum
CREATE TYPE "ToolRequestStatus" AS ENUM ('PENDING', 'FULFILLED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ToolRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolIds" TEXT[],
    "note" TEXT,
    "status" "ToolRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "ToolRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolRequest_status_createdAt_idx" ON "ToolRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ToolRequest_userId_idx" ON "ToolRequest"("userId");

-- AddForeignKey
ALTER TABLE "ToolRequest" ADD CONSTRAINT "ToolRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
