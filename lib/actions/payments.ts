"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import { grantPurchaseAccess } from "@/lib/payments/grant-access";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function submitPaymentOrder(data: {
  toolId: string;
  bankAccountId: string;
  screenshotUrl?: string;
  userNote?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (isMockMode()) {
    const tool = mockStore.tools.find((t) => t.id === data.toolId);
    if (!tool || !tool.active) throw new Error("Tool not available");

    const bank = mockStore.bankAccounts.find(
      (b) => b.id === data.bankAccountId && b.active
    );
    if (!bank) throw new Error("Bank account not available");

    const pending = mockStore.paymentOrders.find(
      (o) =>
        o.userId === session.user.id &&
        o.toolId === data.toolId &&
        o.status === "PENDING"
    );
    if (pending) {
      throw new Error("You already have a pending payment for this tool");
    }

    const order = {
      id: mockId("order"),
      userId: session.user.id,
      toolId: data.toolId,
      amountPkr: tool.pricePkr,
      paymentMethod: "MANUAL" as const,
      bankAccountId: data.bankAccountId,
      screenshotUrl: data.screenshotUrl?.trim() || null,
      status: "PENDING" as const,
      userNote: data.userNote?.trim() || null,
      adminNote: null,
      reviewedAt: null,
      reviewedById: null,
      createdAt: new Date(),
    };
    mockStore.paymentOrders.push(order);

    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    return { orderId: order.id };
  }

  const tool = await prisma.tool.findUnique({ where: { id: data.toolId } });
  if (!tool || !tool.active) throw new Error("Tool not available");

  const bank = await prisma.bankAccount.findFirst({
    where: { id: data.bankAccountId, active: true },
  });
  if (!bank) throw new Error("Bank account not available");

  const existingPending = await prisma.paymentOrder.findFirst({
    where: {
      userId: session.user.id,
      toolId: data.toolId,
      status: "PENDING",
    },
  });
  if (existingPending) {
    throw new Error("You already have a pending payment for this tool");
  }

  const order = await prisma.paymentOrder.create({
    data: {
      userId: session.user.id,
      toolId: data.toolId,
      amountPkr: tool.pricePkr,
      paymentMethod: "MANUAL",
      bankAccountId: data.bankAccountId,
      screenshotUrl: data.screenshotUrl?.trim() || null,
      userNote: data.userNote?.trim() || null,
    },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { orderId: order.id };
}

export async function approvePaymentOrder(orderId: string, adminNote?: string) {
  const session = await requireAdmin();

  if (isMockMode()) {
    const order = mockStore.paymentOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order is not pending");

    const tool = mockStore.tools.find((t) => t.id === order.toolId);
    if (!tool) throw new Error("Tool not found");

    order.status = "APPROVED";
    order.reviewedAt = new Date();
    order.reviewedById = session.user.id;
    order.adminNote = adminNote?.trim() || null;

    await grantPurchaseAccess(
      order.userId,
      order.toolId,
      tool.accessDurationDays
    );

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/users/${order.userId}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    return { success: true };
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: { tool: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING") throw new Error("Order is not pending");

  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      adminNote: adminNote?.trim() || null,
    },
  });

  await grantPurchaseAccess(
    order.userId,
    order.toolId,
    order.tool.accessDurationDays
  );

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/users/${order.userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function rejectPaymentOrder(orderId: string, adminNote: string) {
  const session = await requireAdmin();
  const note = adminNote.trim();
  if (!note) throw new Error("Please provide a reason for rejection");

  if (isMockMode()) {
    const order = mockStore.paymentOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order is not pending");

    order.status = "REJECTED";
    order.reviewedAt = new Date();
    order.reviewedById = session.user.id;
    order.adminNote = note;

    revalidatePath("/admin/payments");
    revalidatePath("/dashboard/orders");
    return { success: true };
  }

  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING") throw new Error("Order is not pending");

  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      adminNote: note,
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/orders");
  return { success: true };
}
