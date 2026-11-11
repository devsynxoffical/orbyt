import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import { isPrismaSchemaDriftError } from "@/lib/prisma/errors";

export type SupportMessageView = {
  id: string;
  senderRole: "USER" | "ADMIN";
  senderId: string;
  body: string;
  createdAt: Date;
};

export type SupportThreadSummary = {
  id: string;
  userId: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  lastMessageAt: Date;
  adminUnreadCount: number;
  userUnreadCount: number;
  user: { id: string; name: string; email: string };
  preview: string | null;
};

export async function getAdminNavBadgeCounts(): Promise<{
  support: number;
  payments: number;
}> {
  if (isMockMode()) {
    return { support: 0, payments: 0 };
  }

  try {
    const [support, payments] = await Promise.all([
      prisma.supportThread.count({
        where: { adminUnreadCount: { gt: 0 }, status: "OPEN" },
      }),
      prisma.paymentOrder.count({ where: { status: "PENDING" } }),
    ]);

    return { support, payments };
  } catch (err) {
    if (!isPrismaSchemaDriftError(err)) throw err;
    const payments = await prisma.paymentOrder.count({
      where: { status: "PENDING" },
    });
    return { support: 0, payments };
  }
}

export async function getUserSupportUnreadCount(userId: string): Promise<number> {
  if (isMockMode()) return 0;
  try {
    const thread = await prisma.supportThread.findFirst({
      where: { userId },
      select: { userUnreadCount: true },
    });
    return thread?.userUnreadCount ?? 0;
  } catch (err) {
    if (isPrismaSchemaDriftError(err)) return 0;
    throw err;
  }
}

export async function getUserSupportThread(userId: string) {
  if (isMockMode()) {
    let thread = mockStore.supportThreads.find((t) => t.userId === userId);
    if (!thread) {
      thread = {
        id: mockId("thread"),
        userId,
        subject: "Support Request",
        status: "OPEN",
        lastMessageAt: new Date(),
        adminUnreadCount: 0,
        userUnreadCount: 0,
        createdAt: new Date(),
      };
      mockStore.supportThreads.push(thread);
    }
    return thread;
  }

  try {
    let thread = await prisma.supportThread.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!thread) {
      thread = await prisma.supportThread.create({
        data: { userId },
      });
    }

    return thread;
  } catch (err) {
    if (isPrismaSchemaDriftError(err)) return null;
    throw err;
  }
}

export async function getSupportMessages(
  threadId: string
): Promise<SupportMessageView[]> {
  if (isMockMode()) {
    return mockStore.supportMessages
      .filter((m) => m.threadId === threadId)
      .map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt,
      }));
  }

  const rows = await prisma.supportMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return rows.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt,
  }));
}

export async function listSupportThreadsForAdmin(): Promise<
  SupportThreadSummary[]
> {
  if (isMockMode()) {
    return mockStore.supportThreads.map((t) => {
      const u = mockStore.users.find((user) => user.id === t.userId);
      const lastMsg = mockStore.supportMessages
        .filter((m) => m.threadId === t.id)
        .slice(-1)[0];
      return {
        id: t.id,
        userId: t.userId,
        subject: t.subject,
        status: t.status,
        lastMessageAt: t.lastMessageAt,
        adminUnreadCount: t.adminUnreadCount,
        userUnreadCount: t.userUnreadCount,
        user: {
          id: t.userId,
          name: u?.name ?? "User",
          email: u?.email ?? "user@demo.com",
        },
        preview: lastMsg?.body ?? null,
      };
    });
  }

  const threads = await prisma.supportThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  return threads.map((t) => ({
    id: t.id,
    userId: t.userId,
    subject: t.subject,
    status: t.status,
    lastMessageAt: t.lastMessageAt,
    adminUnreadCount: t.adminUnreadCount,
    userUnreadCount: t.userUnreadCount,
    user: t.user,
    preview: t.messages[0]?.body ?? null,
  }));
}

export async function getSupportThreadById(threadId: string) {
  if (isMockMode()) {
    const t = mockStore.supportThreads.find((thread) => thread.id === threadId);
    if (!t) return null;
    const u = mockStore.users.find((user) => user.id === t.userId);
    return {
      ...t,
      user: {
        id: t.userId,
        name: u?.name ?? "User",
        email: u?.email ?? "user@demo.com",
      },
    };
  }
  return prisma.supportThread.findUnique({
    where: { id: threadId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
