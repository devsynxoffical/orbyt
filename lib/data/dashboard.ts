import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

export async function getUserDashboardStats(userId: string) {
  if (!userId) {
    return {
      activeTools: 0,
      planName: null,
      subscriptionStatus: null,
      daysUntilRenewal: null,
    };
  }

  if (isMockMode()) {
    const activeTools = mockStore.toolAccess.filter(
      (a) => a.userId === userId && a.status === "ACTIVE"
    ).length;
    const sub = [...mockStore.subscriptions]
      .filter((s) => s.userId === userId && s.status !== "CANCELED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const plan = sub?.planId
      ? mockStore.plans.find((p) => p.id === sub.planId)
      : null;

    let daysUntilRenewal: number | null = null;
    if (sub?.expiresAt) {
      daysUntilRenewal = Math.max(
        0,
        Math.ceil(
          (sub.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    return {
      activeTools,
      planName: plan?.name ?? null,
      subscriptionStatus: sub?.status ?? null,
      daysUntilRenewal,
    };
  }

  try {
    const [activeTools, sub] = await Promise.all([
      prisma.userToolAccess.count({
        where: { userId, status: "ACTIVE" },
      }),
      prisma.subscription.findFirst({
        where: { userId, status: { not: "CANCELED" } },
        orderBy: { createdAt: "desc" },
        include: { plan: true },
      }),
    ]);

    let daysUntilRenewal: number | null = null;
    if (sub?.expiresAt) {
      daysUntilRenewal = Math.max(
        0,
        Math.ceil(
          (sub.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    return {
      activeTools,
      planName: sub?.plan?.name ?? null,
      subscriptionStatus: sub?.status ?? null,
      daysUntilRenewal,
    };
  } catch (err) {
    console.error("[dashboard] getUserDashboardStats failed", err);
    return {
      activeTools: 0,
      planName: null,
      subscriptionStatus: null,
      daysUntilRenewal: null,
    };
  }
}

export async function getRecentUsers(limit = 5) {
  if (isMockMode()) {
    return [...mockStore.users]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        createdAt: u.createdAt,
      }));
  }

  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getAdminExtendedStats() {
  const base = await import("@/lib/data/users").then((m) => m.getAdminStats());

  if (isMockMode()) {
    const stats = await base;
    const totalTools = mockStore.tools.filter((t) => t.active).length;
    const totalPlans = mockStore.plans.filter((p) => p.active).length;
    const suspendedUsers = mockStore.users.filter(
      (u) => u.status === "SUSPENDED"
    ).length;
    return { ...stats, totalTools, totalPlans, suspendedUsers };
  }

  const stats = await base;
  const [totalTools, totalPlans, suspendedUsers] = await Promise.all([
    prisma.tool.count({ where: { active: true } }),
    prisma.plan.count({ where: { active: true } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
  ]);
  return { ...stats, totalTools, totalPlans, suspendedUsers };
}
