import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function syncMockPlanToolAccess(
  userId: string,
  planId: string,
  expiresAt: Date
) {
  const plan = mockStore.plans.find((p) => p.id === planId);
  if (!plan) return;

  for (const toolId of plan.toolIds) {
    const existing = mockStore.toolAccess.find(
      (a) => a.userId === userId && a.toolId === toolId
    );
    if (existing) {
      existing.status = "ACTIVE";
      existing.source = "PLAN";
      existing.grantedAt = new Date();
      existing.expiresAt = expiresAt;
    } else {
      mockStore.toolAccess.push({
        id: mockId("access"),
        userId,
        toolId,
        status: "ACTIVE",
        grantedAt: new Date(),
        expiresAt,
        source: "PLAN",
      });
    }
  }
}

export async function activatePlanForUser(
  userId: string,
  planId: string,
  notes?: string
) {
  if (isMockMode()) {
    const plan = mockStore.plans.find((p) => p.id === planId);
    if (!plan || !plan.active) throw new Error("Plan not found");

    const startedAt = new Date();
    const expiresAt = addDays(startedAt, plan.durationDays);

    let sub = mockStore.subscriptions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!sub) {
      sub = {
        id: mockId("sub"),
        userId,
        planId,
        status: "PENDING",
        startedAt: null,
        expiresAt: null,
        createdAt: new Date(),
        notes: null,
      };
      mockStore.subscriptions.push(sub);
    }

    sub.planId = planId;
    sub.status = "ACTIVE";
    sub.startedAt = startedAt;
    sub.expiresAt = expiresAt;
    sub.notes = notes?.trim() || "Paid via Stripe";

    syncMockPlanToolAccess(userId, planId, expiresAt);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/subscription");
    return { success: true };
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { tools: true },
  });
  if (!plan || !plan.active) throw new Error("Plan not found");

  const startedAt = new Date();
  const expiresAt = addDays(startedAt, plan.durationDays);

  const existing = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        planId,
        status: "ACTIVE",
        startedAt,
        expiresAt,
        notes: notes?.trim() || "Paid via Stripe",
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: "ACTIVE",
        startedAt,
        expiresAt,
        notes: notes?.trim() || "Paid via Stripe",
      },
    });
  }

  for (const { toolId } of plan.tools) {
    await prisma.userToolAccess.upsert({
      where: { userId_toolId: { userId, toolId } },
      update: {
        status: "ACTIVE",
        source: "PLAN",
        grantedAt: startedAt,
        expiresAt,
      },
      create: {
        userId,
        toolId,
        status: "ACTIVE",
        source: "PLAN",
        grantedAt: startedAt,
        expiresAt,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscription");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function fulfillStripePlanPurchase(userId: string, planId: string) {
  await activatePlanForUser(userId, planId, "Paid via Stripe");
}
