"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function dismissToolRequest(requestId: string) {
  const session = await requireAdmin();

  if (isMockMode()) {
    const req = mockStore.toolRequests.find((r) => r.id === requestId);
    if (req) {
      req.status = "DISMISSED";
    }
    revalidatePath("/admin/tools");
    return { success: true };
  }

  await prisma.toolRequest.update({
    where: { id: requestId },
    data: {
      status: "DISMISSED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  revalidatePath("/admin/tools");
  return { success: true };
}

export async function fulfillToolRequest(requestId: string) {
  const session = await requireAdmin();

  if (isMockMode()) {
    const req = mockStore.toolRequests.find((r) => r.id === requestId);
    if (req) {
      req.status = "FULFILLED";
    }
    revalidatePath("/admin/tools");
    return { success: true };
  }

  await prisma.toolRequest.update({
    where: { id: requestId },
    data: {
      status: "FULFILLED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  revalidatePath("/admin/tools");
  return { success: true };
}
