import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function grantPurchaseAccess(
  userId: string,
  toolId: string,
  durationDays: number
) {
  const grantedAt = new Date();
  const expiresAt = addDays(grantedAt, durationDays);

  if (isMockMode()) {
    const existing = mockStore.toolAccess.find(
      (a) => a.userId === userId && a.toolId === toolId
    );
    if (existing) {
      existing.status = "ACTIVE";
      existing.source = "PURCHASE";
      existing.grantedAt = grantedAt;
      existing.expiresAt = expiresAt;
    } else {
      mockStore.toolAccess.push({
        id: mockId("access"),
        userId,
        toolId,
        status: "ACTIVE",
        grantedAt,
        expiresAt,
        source: "PURCHASE",
      });
    }
    return;
  }

  await prisma.userToolAccess.upsert({
    where: { userId_toolId: { userId, toolId } },
    update: {
      status: "ACTIVE",
      source: "PURCHASE",
      grantedAt,
      expiresAt,
    },
    create: {
      userId,
      toolId,
      status: "ACTIVE",
      source: "PURCHASE",
      grantedAt,
      expiresAt,
    },
  });
}

export async function fulfillStripePaymentOrder(orderId: string) {
  if (isMockMode()) {
    const order = mockStore.paymentOrders.find((o) => o.id === orderId);
    if (!order || order.status !== "PENDING") return;
    const tool = mockStore.tools.find((t) => t.id === order.toolId);
    if (!tool) return;

    order.status = "APPROVED";
    order.reviewedAt = new Date();
    order.adminNote = "Paid via Stripe";
    await grantPurchaseAccess(order.userId, order.toolId, tool.accessDurationDays);
    return;
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: { tool: true },
  });
  if (!order || order.status !== "PENDING") return;

  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      adminNote: "Paid via Stripe",
    },
  });

  await grantPurchaseAccess(order.userId, order.toolId, order.tool.accessDurationDays);

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/users/${order.userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
}
