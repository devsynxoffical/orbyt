import { PrismaClient } from "@prisma/client";
import { hashToken } from "./crypto.js";

export const prisma = new PrismaClient();

export async function countLiveSessionsForAccount(toolAccountId: string) {
  const now = new Date();
  return prisma.proxySession.count({
    where: {
      toolAccountId,
      revokedAt: null,
      expiresAt: { gt: now },
    },
  });
}

export async function pickToolAccount(toolId: string) {
  const accounts = await prisma.toolAccount.findMany({
    where: {
      toolId,
      active: true,
      healthStatus: { not: "EXPIRED" },
    },
    orderBy: { createdAt: "asc" },
  });

  if (accounts.length === 0) return null;

  for (const account of accounts) {
    const live = await countLiveSessionsForAccount(account.id);
    if (live < account.maxConcurrentUsers) {
      return account;
    }
  }

  return { full: true as const };
}

export async function createLaunchToken(params: {
  userId: string;
  toolId: string;
  toolAccountId: string;
  token: string;
  expiresAt: Date;
}) {
  return prisma.launchToken.create({
    data: {
      userId: params.userId,
      toolId: params.toolId,
      toolAccountId: params.toolAccountId,
      tokenHash: hashToken(params.token),
      expiresAt: params.expiresAt,
    },
  });
}

/** Atomic one-time consume: only succeeds if unused and unexpired. */
export async function consumeLaunchToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();
  const updated = await prisma.launchToken.updateMany({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });
  if (updated.count === 0) return null;
  return prisma.launchToken.findUnique({ where: { tokenHash } });
}

export async function logLaunch(params: {
  userId: string;
  toolId: string;
  toolAccountId: string;
}) {
  return prisma.toolLaunchLog.create({ data: params });
}

export async function cleanupExpiredTokens() {
  await prisma.launchToken.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  await prisma.proxySession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        {
          revokedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });
}

export async function createPersistedProxySession(params: {
  id: string;
  userId: string;
  toolId: string;
  toolAccountId: string;
  toolSlug: string;
  upstreamOrigin: string;
  expiresAt: Date;
}) {
  return prisma.proxySession.create({
    data: {
      ...params,
      lastAccessCheckAt: new Date(),
    },
  });
}

export async function getPersistedProxySession(id: string) {
  const row = await prisma.proxySession.findUnique({ where: { id } });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt < new Date()) return null;
  return row;
}

export async function touchAccessCheck(id: string) {
  return prisma.proxySession.update({
    where: { id },
    data: { lastAccessCheckAt: new Date() },
  });
}

export async function revokeSessions(params: {
  userId?: string;
  toolId?: string;
  toolAccountId?: string;
  sessionId?: string;
}) {
  const where: {
    userId?: string;
    toolId?: string;
    toolAccountId?: string;
    id?: string;
    revokedAt: null;
  } = { revokedAt: null };
  if (params.userId) where.userId = params.userId;
  if (params.toolId) where.toolId = params.toolId;
  if (params.toolAccountId) where.toolAccountId = params.toolAccountId;
  if (params.sessionId) where.id = params.sessionId;

  return prisma.proxySession.updateMany({
    where,
    data: { revokedAt: new Date() },
  });
}

export async function verifyUserStillHasAccess(userId: string, toolId: string) {
  const [user, access] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    }),
    prisma.userToolAccess.findUnique({
      where: { userId_toolId: { userId, toolId } },
    }),
  ]);

  if (!user || user.status === "SUSPENDED") return false;
  if (!access || access.status !== "ACTIVE") return false;
  if (access.expiresAt && access.expiresAt < new Date()) return false;
  return true;
}

export async function getAccountLoad(toolId: string) {
  const accounts = await prisma.toolAccount.findMany({
    where: { toolId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      maxConcurrentUsers: true,
      active: true,
      healthStatus: true,
    },
  });

  const loads = await Promise.all(
    accounts.map(async (account: (typeof accounts)[number]) => ({
      ...account,
      activeNow: await countLiveSessionsForAccount(account.id),
    }))
  );

  return loads;
}
