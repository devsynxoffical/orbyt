"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  decryptCookieData,
  decryptCookiesToHeader,
  encryptCookiesFromJson,
  parseCookieJson,
} from "@/lib/crypto/cookies";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import {
  isSessionServiceConfigured,
  revokeProxySessions,
  testToolAccountSession,
  fetchAccountLoad,
} from "@/lib/session-service/client";
import { probeCookieSession } from "@/lib/tools/cookie-health";
import { normalizeToolConfig } from "@/lib/tools/extension-presets";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function saveToolAccount(data: {
  id?: string;
  toolId: string;
  label: string;
  cookieJson: string;
  maxConcurrentUsers: number;
  active: boolean;
  notes: string;
}) {
  await requireAdmin();

  const label = data.label.trim();
  if (!label) throw new Error("Account label is required");

  const cookiesChanged = Boolean(data.cookieJson.trim());
  let cookieDataEnc: string;
  if (data.id && !cookiesChanged) {
    if (isMockMode()) {
      const existing = mockStore.toolAccounts.find((a) => a.id === data.id);
      if (!existing) throw new Error("Account not found");
      cookieDataEnc = existing.cookieDataEnc;
    } else {
      const existing = await prisma.toolAccount.findUnique({
        where: { id: data.id },
      });
      if (!existing) throw new Error("Account not found");
      cookieDataEnc = existing.cookieDataEnc;
    }
  } else {
    cookieDataEnc = encryptCookiesFromJson(data.cookieJson);
  }

  const healthReset = cookiesChanged
    ? {
        healthStatus: "ALIVE" as const,
        lastHealthCheckAt: new Date(),
        lastHealthError: null,
      }
    : {};

  if (isMockMode()) {
    if (data.id) {
      const account = mockStore.toolAccounts.find((a) => a.id === data.id);
      if (!account) throw new Error("Account not found");
      Object.assign(account, {
        label,
        cookieDataEnc,
        maxConcurrentUsers: data.maxConcurrentUsers,
        active: data.active,
        notes: data.notes.trim() || null,
        ...healthReset,
      });
    } else {
      mockStore.toolAccounts.push({
        id: mockId("tacc"),
        toolId: data.toolId,
        label,
        cookieDataEnc,
        maxConcurrentUsers: data.maxConcurrentUsers,
        active: data.active,
        healthStatus: "ALIVE",
        lastHealthCheckAt: new Date(),
        lastHealthError: null,
        lastVerifiedAt: new Date(),
        notes: data.notes.trim() || null,
        createdAt: new Date(),
      });
    }
    revalidatePath(`/admin/tools/${data.toolId}/accounts`);
    return { success: true };
  }

  if (data.id) {
    await prisma.toolAccount.update({
      where: { id: data.id },
      data: {
        label,
        cookieDataEnc,
        maxConcurrentUsers: data.maxConcurrentUsers,
        active: data.active,
        notes: data.notes.trim() || null,
        ...healthReset,
      },
    });
    if (cookiesChanged) {
      await revokeProxySessions({ toolAccountId: data.id });
    }
  } else {
    await prisma.toolAccount.create({
      data: {
        toolId: data.toolId,
        label,
        cookieDataEnc,
        maxConcurrentUsers: data.maxConcurrentUsers,
        active: data.active,
        notes: data.notes.trim() || null,
        healthStatus: "ALIVE",
        lastHealthCheckAt: new Date(),
      },
    });
  }

  revalidatePath(`/admin/tools/${data.toolId}/accounts`);
  revalidatePath("/admin/tools");
  return { success: true };
}

export async function deleteToolAccount(id: string, toolId: string) {
  await requireAdmin();

  if (isMockMode()) {
    const idx = mockStore.toolAccounts.findIndex((a) => a.id === id);
    if (idx >= 0) mockStore.toolAccounts.splice(idx, 1);
    revalidatePath(`/admin/tools/${toolId}/accounts`);
    return { success: true };
  }

  await revokeProxySessions({ toolAccountId: id });
  await prisma.toolAccount.delete({ where: { id } });
  revalidatePath(`/admin/tools/${toolId}/accounts`);
  return { success: true };
}

export async function toggleToolAccountActive(id: string, toolId: string) {
  await requireAdmin();

  if (isMockMode()) {
    const account = mockStore.toolAccounts.find((a) => a.id === id);
    if (!account) throw new Error("Account not found");
    account.active = !account.active;
    revalidatePath(`/admin/tools/${toolId}/accounts`);
    return { active: account.active };
  }

  const account = await prisma.toolAccount.findUnique({ where: { id } });
  if (!account) throw new Error("Account not found");
  const updated = await prisma.toolAccount.update({
    where: { id },
    data: { active: !account.active },
  });
  if (!updated.active) {
    await revokeProxySessions({ toolAccountId: id });
  }
  revalidatePath(`/admin/tools/${toolId}/accounts`);
  return { active: updated.active };
}

export async function testToolAccount(id: string, toolId: string) {
  await requireAdmin();

  if (isMockMode()) {
    const account = mockStore.toolAccounts.find((a) => a.id === id);
    if (!account) throw new Error("Account not found");
    const rawTool = mockStore.tools.find((t) => t.id === toolId);
    if (!rawTool) throw new Error("Tool not found");
    const tool = normalizeToolConfig(rawTool);
    if (tool.needsDbHeal) {
      rawTool.launchUrl = tool.launchUrl;
      rawTool.launchMode = tool.launchMode;
    }
    if (!tool.launchUrl) {
      throw new Error("Set a Launch URL on this tool before testing");
    }
    let cookieHeader: string;
    try {
      cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
    } catch {
      account.healthStatus = "UNKNOWN";
      account.lastHealthError = "Could not decrypt cookies";
      account.lastHealthCheckAt = new Date();
      return {
        healthStatus: "UNKNOWN" as const,
        message: "Could not decrypt cookies",
      };
    }
    const result = await probeCookieSession({
      launchUrl: tool.launchUrl,
      cookieHeader,
      toolSlug: tool.slug,
      launchMode: tool.launchMode,
    });
    account.healthStatus = result.healthStatus;
    account.lastHealthCheckAt = new Date();
    account.lastHealthError =
      result.healthStatus === "ALIVE" ? null : result.message;
    revalidatePath(`/admin/tools/${toolId}/accounts`);
    return result;
  }

  const account = await prisma.toolAccount.findUnique({
    where: { id },
    include: { tool: true },
  });
  if (!account || account.toolId !== toolId) {
    throw new Error("Account not found");
  }

  const normalizedTool = normalizeToolConfig(account.tool);
  if (normalizedTool.needsDbHeal) {
    await prisma.tool
      .update({
        where: { id: account.tool.id },
        data: {
          launchUrl: normalizedTool.launchUrl,
          launchMode: normalizedTool.launchMode,
        },
      })
      .catch(() => undefined);
  }

  if (!normalizedTool.launchUrl) {
    throw new Error("Set a Launch URL on this tool before testing");
  }

  // Only delegate to session-service for PROXY tools.
  // EXTENSION tools (Canva, ChatGPT, Claude, Grammarly) are tested directly.
  if (
    normalizedTool.launchMode === "PROXY" &&
    isSessionServiceConfigured()
  ) {
    const result = await testToolAccountSession(id);
    revalidatePath(`/admin/tools/${toolId}/accounts`);
    return result;
  }

  let cookieHeader: string;
  let cookieCount = 0;
  try {
    const rawJson = decryptCookieData(account.cookieDataEnc);
    const parsed = parseCookieJson(rawJson);
    cookieCount = parsed.length;
    cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
  } catch {
    await prisma.toolAccount.update({
      where: { id },
      data: {
        healthStatus: "UNKNOWN",
        lastHealthCheckAt: new Date(),
        lastHealthError: "Could not decrypt cookies",
      },
    });
    return {
      healthStatus: "UNKNOWN" as const,
      message: "Could not decrypt cookies",
    };
  }

  const result = await probeCookieSession({
    launchUrl: normalizedTool.launchUrl,
    cookieHeader,
    toolSlug: normalizedTool.slug,
    launchMode: normalizedTool.launchMode,
  });

  const finalResult =
    normalizedTool.launchMode === "EXTENSION" &&
    cookieCount > 0 &&
    result.healthStatus === "ALIVE"
      ? {
          healthStatus: "ALIVE" as const,
          message: `Verified ${cookieCount} session cookies ready for Chrome extension launch`,
        }
      : result;

  await prisma.toolAccount.update({
    where: { id },
    data: {
      healthStatus: finalResult.healthStatus,
      lastHealthCheckAt: new Date(),
      lastHealthError:
        finalResult.healthStatus === "ALIVE" ? null : finalResult.message,
    },
  });

  revalidatePath(`/admin/tools/${toolId}/accounts`);
  return finalResult;
}

export async function getToolAccountCapacity(toolId: string) {
  await requireAdmin();
  if (!isSessionServiceConfigured()) return [];
  try {
    return await fetchAccountLoad(toolId);
  } catch {
    return [];
  }
}
