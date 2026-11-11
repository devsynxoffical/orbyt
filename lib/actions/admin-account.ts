"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isMockMode } from "@/lib/config";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function generateTempPassword() {
  return `Temp@${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function createUser(name: string, email: string) {
  await requireAdmin();

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!trimmedName || !normalizedEmail) {
    throw new Error("Name and email are required");
  }

  const tempPassword = generateTempPassword();

  if (isMockMode()) {
    if (mockStore.users.some((u) => u.email === normalizedEmail)) {
      throw new Error("A user with this email already exists");
    }

    const userId = mockId("user");
    mockStore.users.push({
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      password: tempPassword,
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date(),
    });

    mockStore.subscriptions.push({
      id: mockId("sub"),
      userId,
      planId: null,
      status: "PENDING",
      startedAt: null,
      expiresAt: null,
      createdAt: new Date(),
      notes: null,
    });

    revalidatePath("/admin/users");
    return { userId, tempPassword };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) throw new Error("A user with this email already exists");

  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      subscriptions: {
        create: { status: "PENDING" },
      },
    },
  });

  revalidatePath("/admin/users");
  return { userId: user.id, tempPassword };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (isMockMode()) {
    const user = mockStore.users.find((u) => u.id === session.user.id);
    if (!user || user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }
    user.password = newPassword;
    return { success: true };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 },
    },
  });
  return { success: true };
}
