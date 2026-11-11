import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: Date;
  _count?: { subscriptions: number };
  subscriptionStatus?: string | null;
};

export async function getUsers(filters?: {
  search?: string;
  status?: UserStatus | "ALL";
}): Promise<UserRow[]> {
  if (isMockMode()) {
    let users = [...mockStore.users];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== "ALL") {
      users = users.filter((u) => u.status === filters.status);
    }
    return users.map((u) => {
      const latestSub = [...mockStore.subscriptions]
        .filter((s) => s.userId === u.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        subscriptionStatus: latestSub?.status ?? null,
        _count: {
          subscriptions: mockStore.subscriptions.filter(
            (s) => s.userId === u.id && s.status === "ACTIVE"
          ).length,
        },
      };
    });
  }

  const where: Record<string, unknown> = {};
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { subscriptions: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    subscriptionStatus: u.subscriptions[0]?.status ?? null,
    _count: u._count,
  }));
}

export async function getUserById(id: string) {
  if (isMockMode()) {
    const user = mockStore.users.find((u) => u.id === id);
    if (!user) return null;

    const subscriptions = mockStore.subscriptions
      .filter((s) => s.userId === id)
      .map((s) => {
        const plan = s.planId
          ? mockStore.plans.find((p) => p.id === s.planId)
          : null;
        return {
          ...s,
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
      });

    const toolAccess = mockStore.toolAccess
      .filter((a) => a.userId === id)
      .map((a) => ({
        ...a,
        tool: mockStore.tools.find((t) => t.id === a.toolId)!,
      }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      subscriptions,
      toolAccess,
    };
  }

  return prisma.user.findUnique({
    where: { id },
    include: {
      subscriptions: {
        include: {
          plan: { include: { tools: { include: { tool: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
      toolAccess: { include: { tool: true } },
    },
  });
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (isMockMode()) {
    const user = mockStore.users.find((u) => u.email === normalized);
    if (!user) return null;
    return getUserById(user.id);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: {
      toolAccess: { include: { tool: true } },
    },
  });

  return user;
}

export async function getAdminStats() {
  if (isMockMode()) {
    const totalUsers = mockStore.users.filter((u) => u.role === "USER").length;
    const activeSubs = mockStore.subscriptions.filter(
      (s) => s.status === "ACTIVE"
    );
    const pendingSubs = mockStore.subscriptions.filter(
      (s) => s.status === "PENDING"
    );
    return {
      totalUsers,
      activeSubscriptions: activeSubs.length,
      pendingSubscriptions: pendingSubs.length,
    };
  }

  const [totalUsers, activeSubscriptions, pendingSubscriptions] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "PENDING" } }),
    ]);

  return { totalUsers, activeSubscriptions, pendingSubscriptions };
}
