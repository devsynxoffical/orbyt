import { createHash, randomBytes } from "crypto";
import {
  decryptCookieData,
  parseCookieJson,
  type StoredCookie,
} from "@/lib/crypto/cookies";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import { normalizeToolConfig } from "@/lib/tools/extension-presets";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hasValidEncryptedCookies(cookieDataEnc: string): boolean {
  try {
    const parsed = parseCookieJson(decryptCookieData(cookieDataEnc));
    return parsed.length > 0;
  } catch {
    return false;
  }
}

export async function pickLaunchAccount(toolId: string) {
  if (isMockMode()) {
    const active = mockStore.toolAccounts.filter(
      (a) => a.toolId === toolId && a.active && hasValidEncryptedCookies(a.cookieDataEnc)
    );
    const healthy = active.find((a) => a.healthStatus !== "EXPIRED");
    return healthy ?? active[0] ?? null;
  }

  const accounts = await prisma.toolAccount.findMany({
    where: {
      toolId,
      active: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const validAccounts = accounts.filter((a) =>
    hasValidEncryptedCookies(a.cookieDataEnc)
  );
  if (validAccounts.length === 0) return null;

  const nonExpired = validAccounts.find((a) => a.healthStatus !== "EXPIRED");
  if (nonExpired) return nonExpired;

  // Fallback: if an active account has valid cookies in storage but was previously
  // marked EXPIRED by a server-side Cloudflare 403 check, heal it and allow launch.
  const fallback = validAccounts[0];
  await prisma.toolAccount
    .update({
      where: { id: fallback.id },
      data: {
        healthStatus: "ALIVE",
        lastHealthError: null,
      },
    })
    .catch(() => undefined);

  return fallback;
}

export async function createExtensionClaimToken(params: {
  userId: string;
  toolId: string;
  toolAccountId: string;
}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  const tokenHash = hashToken(token);

  if (isMockMode()) {
    mockStore.launchTokens.push({
      id: mockId("ltok"),
      tokenHash,
      userId: params.userId,
      toolId: params.toolId,
      toolAccountId: params.toolAccountId,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    });
    return { token, expiresAt };
  }

  await prisma.launchToken.create({
    data: {
      tokenHash,
      userId: params.userId,
      toolId: params.toolId,
      toolAccountId: params.toolAccountId,
      expiresAt,
    },
  });
  await prisma.toolLaunchLog.create({
    data: {
      userId: params.userId,
      toolId: params.toolId,
      toolAccountId: params.toolAccountId,
    },
  });
  return { token, expiresAt };
}

export async function claimExtensionLaunch(token: string): Promise<{
  openUrl: string;
  cookies: StoredCookie[];
  toolName: string;
} | null> {
  const tokenHash = hashToken(token);
  const now = new Date();

  if (isMockMode()) {
    const row = mockStore.launchTokens.find(
      (t) => !t.usedAt && t.tokenHash === tokenHash && t.expiresAt > now
    );
    if (!row) return null;
    row.usedAt = now;

    const rawTool = mockStore.tools.find((t) => t.id === row.toolId);
    const account = mockStore.toolAccounts.find(
      (a) => a.id === row.toolAccountId
    );
    const user = mockStore.users.find((u) => u.id === row.userId);
    if (!rawTool || !account?.active || !user || user.status === "SUSPENDED" || user.status === "LOCKED") {
      return null;
    }

    const tool = normalizeToolConfig(rawTool);
    if (!tool.launchUrl) return null;

    const access = mockStore.toolAccess.find(
      (a) =>
        a.userId === row.userId &&
        a.toolId === tool.id &&
        a.status === "ACTIVE" &&
        (!a.expiresAt || a.expiresAt > now)
    );
    if (!access) return null;

    const cookies = parseCookieJson(decryptCookieData(account.cookieDataEnc));
    return {
      openUrl: tool.launchUrl,
      cookies,
      toolName: tool.name,
    };
  }

  const updated = await prisma.launchToken.updateMany({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });
  if (updated.count === 0) return null;

  const row = await prisma.launchToken.findUnique({ where: { tokenHash } });
  if (!row) return null;

  const [rawTool, account, user] = await Promise.all([
    prisma.tool.findUnique({ where: { id: row.toolId } }),
    prisma.toolAccount.findUnique({ where: { id: row.toolAccountId } }),
    prisma.user.findUnique({
      where: { id: row.userId },
      select: { status: true },
    }),
  ]);

  if (!rawTool || !account?.active || !user || user.status === "SUSPENDED" || user.status === "LOCKED") {
    return null;
  }

  const tool = normalizeToolConfig(rawTool);
  if (!tool.launchUrl) return null;

  const access = await prisma.userToolAccess.findUnique({
    where: { userId_toolId: { userId: row.userId, toolId: tool.id } },
  });
  if (
    !access ||
    access.status !== "ACTIVE" ||
    (access.expiresAt && access.expiresAt < now)
  ) {
    return null;
  }

  const cookies = parseCookieJson(decryptCookieData(account.cookieDataEnc));
  return {
    openUrl: tool.launchUrl,
    cookies,
    toolName: tool.name,
  };
}
