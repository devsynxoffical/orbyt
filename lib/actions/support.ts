"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";
import {
  getSupportMessages,
  type SupportMessageView,
} from "@/lib/data/support";

const MAX_BODY = 4000;

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function revalidateSupportPaths() {
  revalidatePath("/dashboard/support");
  revalidatePath("/admin/support");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function fetchSupportMessagesAction(
  threadId: string
): Promise<SupportMessageView[]> {
  const session = await requireSession();
  if (isMockMode()) {
    return getSupportMessages(threadId);
  }

  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
  });
  if (!thread) throw new Error("Conversation not found");

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && thread.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return getSupportMessages(threadId);
}

export async function markSupportThreadReadAction(threadId: string) {
  const session = await requireSession();
  if (isMockMode()) {
    const thread = mockStore.supportThreads.find((t) => t.id === threadId);
    if (!thread) return;
    const isAdmin = session.user.role === "ADMIN";
    if (isAdmin) thread.adminUnreadCount = 0;
    else thread.userUnreadCount = 0;
    revalidateSupportPaths();
    return;
  }

  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
  });
  if (!thread) return;

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && thread.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (isAdmin && thread.adminUnreadCount > 0) {
    await prisma.supportThread.update({
      where: { id: threadId },
      data: { adminUnreadCount: 0 },
    });
  } else if (!isAdmin && thread.userUnreadCount > 0) {
    await prisma.supportThread.update({
      where: { id: threadId },
      data: { userUnreadCount: 0 },
    });
  }

  revalidateSupportPaths();
}

export async function sendSupportMessageAction(
  threadId: string,
  body: string
): Promise<SupportMessageView> {
  const session = await requireSession();

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > MAX_BODY) {
    throw new Error("Message is too long");
  }

  if (isMockMode()) {
    let thread = mockStore.supportThreads.find((t) => t.id === threadId);
    if (!thread) {
      thread = {
        id: threadId,
        userId: session.user.id,
        subject: "Support Request",
        status: "OPEN",
        lastMessageAt: new Date(),
        adminUnreadCount: 0,
        userUnreadCount: 0,
        createdAt: new Date(),
      };
      mockStore.supportThreads.push(thread);
    }

    const isAdmin = session.user.role === "ADMIN";
    const senderRole = isAdmin ? "ADMIN" : "USER";
    const newMsg: SupportMessageView = {
      id: mockId("msg"),
      senderRole,
      senderId: session.user.id,
      body: trimmed,
      createdAt: new Date(),
    };
    mockStore.supportMessages.push({
      ...newMsg,
      threadId,
    });
    thread.lastMessageAt = new Date();
    thread.status = "OPEN";
    if (isAdmin) {
      thread.userUnreadCount += 1;
    } else {
      thread.adminUnreadCount += 1;
    }
    revalidateSupportPaths();
    return newMsg;
  }

  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
  });
  if (!thread) throw new Error("Conversation not found");
  if (thread.status === "CLOSED") {
    throw new Error("This conversation is closed. Ask admin to reopen it.");
  }

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && thread.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const senderRole = isAdmin ? "ADMIN" : "USER";

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.supportMessage.create({
      data: {
        threadId,
        senderRole,
        senderId: session.user.id,
        body: trimmed,
      },
    });

    await tx.supportThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: created.createdAt,
        status: "OPEN",
        adminUnreadCount: isAdmin
          ? 0
          : { increment: 1 },
        userUnreadCount: isAdmin
          ? { increment: 1 }
          : 0,
      },
    });

    return created;
  });

  revalidateSupportPaths();

  return {
    id: message.id,
    senderRole: message.senderRole,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt,
  };
}

export async function setSupportThreadStatusAction(
  threadId: string,
  status: "OPEN" | "CLOSED"
) {
  await requireAdmin();
  if (isMockMode()) {
    const thread = mockStore.supportThreads.find((t) => t.id === threadId);
    if (thread) thread.status = status;
    revalidateSupportPaths();
    return;
  }

  await prisma.supportThread.update({
    where: { id: threadId },
    data: { status },
  });
  revalidateSupportPaths();
}
