import { decryptCookieData, parseCookieJson } from "@/lib/crypto/cookies";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

export type ToolAccountView = {
  id: string;
  toolId: string;
  label: string;
  maxConcurrentUsers: number;
  active: boolean;
  healthStatus: "UNKNOWN" | "ALIVE" | "EXPIRED";
  lastHealthCheckAt: Date | null;
  lastHealthError: string | null;
  lastVerifiedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  cookieCount?: number;
  activeNow?: number;
};

export async function getToolAccounts(toolId: string): Promise<ToolAccountView[]> {
  if (isMockMode()) {
    return mockStore.toolAccounts
      .filter((a) => a.toolId === toolId)
      .map(({ cookieDataEnc, ...rest }) => {
        const cookieCount = safeCookieCount(cookieDataEnc);
        return {
          ...rest,
          healthStatus: rest.healthStatus ?? "UNKNOWN",
          lastHealthCheckAt: rest.lastHealthCheckAt ?? null,
          lastHealthError: rest.lastHealthError ?? null,
          cookieCount,
        };
      });
  }

  const rows = await prisma.toolAccount.findMany({
    where: { toolId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(({ cookieDataEnc, ...rest }) => {
    const cookieCount = safeCookieCount(cookieDataEnc);
    const wasCloudflareFalsePositive =
      rest.healthStatus === "EXPIRED" &&
      cookieCount > 0 &&
      typeof rest.lastHealthError === "string" &&
      (rest.lastHealthError.includes("HTTP 403") ||
        rest.lastHealthError.includes("HTTP 503"));

    if (wasCloudflareFalsePositive) {
      prisma.toolAccount
        .update({
          where: { id: rest.id },
          data: {
            healthStatus: "ALIVE",
            lastHealthError: null,
          },
        })
        .catch(() => undefined);
    }

    return {
      ...rest,
      healthStatus: wasCloudflareFalsePositive ? "ALIVE" : rest.healthStatus,
      lastHealthError: wasCloudflareFalsePositive ? null : rest.lastHealthError,
      cookieCount,
    };
  });
}

function safeCookieCount(enc: string): number {
  try {
    return parseCookieJson(decryptCookieData(enc)).length;
  } catch {
    return 0;
  }
}

export async function getActiveAccountCount(toolId: string): Promise<number> {
  if (isMockMode()) {
    return mockStore.toolAccounts.filter((a) => a.toolId === toolId && a.active)
      .length;
  }
  return prisma.toolAccount.count({ where: { toolId, active: true } });
}
