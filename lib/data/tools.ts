import { AccessStatus, SubStatus, type ToolLaunchMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { expireStaleAccessRecords } from "@/lib/access/maintenance";
import { isPrismaSchemaDriftError } from "@/lib/prisma/errors";
import { normalizeToolConfig } from "@/lib/tools/extension-presets";

type ToolRowLegacy = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  pricePkr: number;
  accessDurationDays: number;
  launchUrl: string | null;
  allowedHosts: string[];
  proxySubdomain: string | null;
  active: boolean;
  launchMode?: ToolLaunchMode;
};

async function findAllToolsLegacyFallback(): Promise<ToolRowLegacy[]> {
  try {
    const rows = await prisma.$queryRaw<ToolRowLegacy[]>`
      SELECT
        id,
        name,
        slug,
        description,
        "iconUrl",
        "pricePkr",
        "accessDurationDays",
        "launchUrl",
        "allowedHosts",
        "proxySubdomain",
        active
      FROM "Tool"
      ORDER BY name ASC
    `;
    return rows.map((t) => ({ ...t, launchMode: "PROXY" as ToolLaunchMode }));
  } catch (err) {
    if (!isPrismaSchemaDriftError(err)) throw err;
    const rows = await prisma.$queryRaw<
      Omit<ToolRowLegacy, "allowedHosts" | "proxySubdomain" | "launchMode">[]
    >`
      SELECT
        id,
        name,
        slug,
        description,
        "iconUrl",
        "pricePkr",
        "accessDurationDays",
        "launchUrl",
        active
      FROM "Tool"
      ORDER BY name ASC
    `;
    return rows.map((t) => ({
      ...t,
      allowedHosts: [],
      proxySubdomain: null,
      launchMode: "PROXY" as ToolLaunchMode,
    }));
  }
}

export async function getAllTools() {
  if (isMockMode()) {
    return mockStore.tools.map((t) => {
      const norm = normalizeToolConfig(t);
      if (norm.needsDbHeal) {
        t.launchUrl = norm.launchUrl;
        t.launchMode = norm.launchMode;
      }
      return norm;
    });
  }
  try {
    const rows = await prisma.tool.findMany({ orderBy: { name: "asc" } });
    return rows.map((t) => {
      const norm = normalizeToolConfig(t);
      if (norm.needsDbHeal) {
        prisma.tool
          .update({
            where: { id: t.id },
            data: {
              launchUrl: norm.launchUrl,
              launchMode: norm.launchMode,
            },
          })
          .catch(() => undefined);
      }
      return norm;
    });
  } catch (err) {
    if (!isPrismaSchemaDriftError(err)) {
      console.error("[tools] getAllTools failed", err);
      return [];
    }
    try {
      const legacy = await findAllToolsLegacyFallback();
      return legacy.map((t) => normalizeToolConfig(t));
    } catch (fallbackErr) {
      console.error("[tools] getAllTools fallback failed", fallbackErr);
      return [];
    }
  }
}

export async function getActiveToolsForPricing() {
  if (isMockMode()) {
    return [...mockStore.tools]
      .filter((t) => t.active && t.pricePkr > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Build environments (Railway, etc.) may run `next build` without DATABASE_URL.
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await prisma.tool.findMany({
      where: { active: true, pricePkr: { gt: 0 } },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[tools] getActiveToolsForPricing failed", err);
    return [];
  }
}

export async function getToolBySlug(slug: string) {
  if (isMockMode()) {
    const found = mockStore.tools.find((t) => t.slug === slug) ?? null;
    return found ? normalizeToolConfig(found) : null;
  }

  const found = await prisma.tool.findUnique({ where: { slug } });
  if (!found) return null;
  const norm = normalizeToolConfig(found);
  if (norm.needsDbHeal) {
    prisma.tool
      .update({
        where: { id: found.id },
        data: {
          launchUrl: norm.launchUrl,
          launchMode: norm.launchMode,
        },
      })
      .catch(() => undefined);
  }
  return norm;
}

export async function getUserToolAccess(userId: string) {
  if (!userId) return [];

  try {
    await expireStaleAccessRecords();
  } catch (err) {
    console.error("[tools] expireStaleAccessRecords failed", err);
  }

  if (isMockMode()) {
    return mockStore.toolAccess
      .filter((a) => a.userId === userId)
      .map((a) => ({
        ...a,
        tool: mockStore.tools.find((t) => t.id === a.toolId)!,
      }));
  }

  try {
    const [accessRows, tools] = await Promise.all([
      prisma.userToolAccess.findMany({
        where: { userId },
        orderBy: { grantedAt: "desc" },
      }),
      getAllTools(),
    ]);

    const toolsById = new Map(tools.map((t) => [t.id, t]));

    return accessRows
      .map((row) => {
        const tool = toolsById.get(row.toolId);
        if (!tool) return null;
        return { ...row, tool };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  } catch (err) {
    console.error("[tools] getUserToolAccess failed", err);
    return [];
  }
}

export type UserSubscriptionView = {
  id: string;
  status: SubStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  plan: {
    id: string;
    name: string;
    pricePkr: number;
    durationDays: number;
    tools: { tool: { id: string; name: string; slug: string } }[];
  } | null;
};

export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionView | null> {
  if (isMockMode()) {
    const sub = [...mockStore.subscriptions]
      .filter((s) => s.userId === userId && s.status !== "CANCELED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!sub) return null;

    const plan = sub.planId
      ? mockStore.plans.find((p) => p.id === sub.planId)
      : null;

    return {
      id: sub.id,
      status: sub.status,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      notes: sub.notes,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            pricePkr: plan.pricePkr,
            durationDays: plan.durationDays,
            tools: plan.toolIds.map((toolId) => ({
              tool: mockStore.tools.find((t) => t.id === toolId)!,
            })),
          }
        : null,
    };
  }

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { not: "CANCELED" } },
    orderBy: { createdAt: "desc" },
    include: {
      plan: { include: { tools: { include: { tool: true } } } },
    },
  });

  if (!sub) return null;

  return {
    id: sub.id,
    status: sub.status,
    startedAt: sub.startedAt,
    expiresAt: sub.expiresAt,
    notes: sub.notes,
    plan: sub.plan
      ? {
          id: sub.plan.id,
          name: sub.plan.name,
          pricePkr: sub.plan.pricePkr,
          durationDays: sub.plan.durationDays,
          tools: sub.plan.tools,
        }
      : null,
  };
}

export async function getAllSubscriptions() {
  if (isMockMode()) {
    return mockStore.subscriptions
      .map((sub) => {
        const user = mockStore.users.find((u) => u.id === sub.userId)!;
        const plan = sub.planId
          ? mockStore.plans.find((p) => p.id === sub.planId)
          : null;
        return { ...sub, user, plan };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return prisma.subscription.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export type ToolAccessWithTool = {
  id: string;
  status: AccessStatus;
  grantedAt: Date;
  expiresAt: Date | null;
  source: string;
  tool: { id: string; name: string; slug: string; description: string | null };
};
