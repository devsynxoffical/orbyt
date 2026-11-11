-- CreateTable
CREATE TABLE "ToolAccount" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cookieDataEnc" TEXT NOT NULL,
    "maxConcurrentUsers" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "toolAccountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaunchToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolLaunchLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "toolAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolLaunchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolAccount_toolId_active_idx" ON "ToolAccount"("toolId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchToken_token_key" ON "LaunchToken"("token");

-- CreateIndex
CREATE INDEX "LaunchToken_token_idx" ON "LaunchToken"("token");

-- CreateIndex
CREATE INDEX "LaunchToken_expiresAt_idx" ON "LaunchToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ToolLaunchLog_userId_createdAt_idx" ON "ToolLaunchLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ToolLaunchLog_toolId_createdAt_idx" ON "ToolLaunchLog"("toolId", "createdAt");

-- AddForeignKey
ALTER TABLE "ToolAccount" ADD CONSTRAINT "ToolAccount_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolLaunchLog" ADD CONSTRAINT "ToolLaunchLog_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolLaunchLog" ADD CONSTRAINT "ToolLaunchLog_toolAccountId_fkey" FOREIGN KEY ("toolAccountId") REFERENCES "ToolAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
