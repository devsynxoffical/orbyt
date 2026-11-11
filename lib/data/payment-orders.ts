import { PaymentOrderStatus } from "@prisma/client";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

export type PaymentOrderView = {
  id: string;
  userId: string;
  toolId: string;
  amountPkr: number;
  paymentMethod: "MANUAL" | "STRIPE";
  bankAccountId: string | null;
  screenshotUrl: string | null;
  status: PaymentOrderStatus;
  userNote: string | null;
  adminNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  tool: { id: string; name: string; slug: string };
  bankAccount: {
    id: string;
    bankName: string;
    accountTitle: string;
    accountNumber: string;
  } | null;
};

function mapMockOrder(order: (typeof mockStore.paymentOrders)[number]): PaymentOrderView {
  const user = mockStore.users.find((u) => u.id === order.userId)!;
  const tool = mockStore.tools.find((t) => t.id === order.toolId)!;
  const bankAccount = order.bankAccountId
    ? mockStore.bankAccounts.find((b) => b.id === order.bankAccountId)
    : null;
  return {
    ...order,
    paymentMethod: order.paymentMethod ?? "MANUAL",
    bankAccountId: order.bankAccountId ?? null,
    user: { id: user.id, name: user.name, email: user.email },
    tool: { id: tool.id, name: tool.name, slug: tool.slug },
    bankAccount: bankAccount
      ? {
          id: bankAccount.id,
          bankName: bankAccount.bankName,
          accountTitle: bankAccount.accountTitle,
          accountNumber: bankAccount.accountNumber,
        }
      : null,
  };
}

export async function getPaymentOrdersByUser(
  userId: string
): Promise<PaymentOrderView[]> {
  if (isMockMode()) {
    return mockStore.paymentOrders
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(mapMockOrder);
  }

  return prisma.paymentOrder.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tool: { select: { id: true, name: true, slug: true } },
      bankAccount: {
        select: {
          id: true,
          bankName: true,
          accountTitle: true,
          accountNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingPaymentOrders(): Promise<PaymentOrderView[]> {
  if (isMockMode()) {
    return mockStore.paymentOrders
      .filter(
        (o) =>
          o.status === "PENDING" && (o.paymentMethod ?? "MANUAL") === "MANUAL"
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(mapMockOrder);
  }

  return prisma.paymentOrder.findMany({
    where: { status: "PENDING", paymentMethod: "MANUAL" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tool: { select: { id: true, name: true, slug: true } },
      bankAccount: {
        select: {
          id: true,
          bankName: true,
          accountTitle: true,
          accountNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPaymentOrders(
  status?: PaymentOrderStatus
): Promise<PaymentOrderView[]> {
  if (isMockMode()) {
    return mockStore.paymentOrders
      .filter((o) => !status || o.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(mapMockOrder);
  }

  return prisma.paymentOrder.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      tool: { select: { id: true, name: true, slug: true } },
      bankAccount: {
        select: {
          id: true,
          bankName: true,
          accountTitle: true,
          accountNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countPendingPaymentOrders(): Promise<number> {
  if (isMockMode()) {
    return mockStore.paymentOrders.filter(
      (o) => o.status === "PENDING" && (o.paymentMethod ?? "MANUAL") === "MANUAL"
    ).length;
  }

  return prisma.paymentOrder.count({
    where: { status: "PENDING", paymentMethod: "MANUAL" },
  });
}

export async function getPaymentAdminStats() {
  if (isMockMode()) {
    const orders = mockStore.paymentOrders;
    return {
      pendingManual: orders.filter(
        (o) => o.status === "PENDING" && (o.paymentMethod ?? "MANUAL") === "MANUAL"
      ).length,
      pendingStripe: orders.filter(
        (o) => o.status === "PENDING" && o.paymentMethod === "STRIPE"
      ).length,
      approved: orders.filter((o) => o.status === "APPROVED").length,
      total: orders.length,
      stripeTotal: orders.filter((o) => o.paymentMethod === "STRIPE").length,
    };
  }

  const [pendingManual, pendingStripe, approved, total, stripeTotal] =
    await Promise.all([
      prisma.paymentOrder.count({
        where: { status: "PENDING", paymentMethod: "MANUAL" },
      }),
      prisma.paymentOrder.count({
        where: { status: "PENDING", paymentMethod: "STRIPE" },
      }),
      prisma.paymentOrder.count({ where: { status: "APPROVED" } }),
      prisma.paymentOrder.count(),
      prisma.paymentOrder.count({ where: { paymentMethod: "STRIPE" } }),
    ]);

  return { pendingManual, pendingStripe, approved, total, stripeTotal };
}
