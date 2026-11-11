"use server";

import { revalidatePath } from "next/cache";
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

export async function savePlatformSettings(data: {
  whatsappNumber: string;
  defaultAccessDays: number;
  paymentInstructions: string;
}) {
  await requireAdmin();

  const whatsappNumber = data.whatsappNumber.trim() || null;
  const paymentInstructions = data.paymentInstructions.trim() || null;
  const defaultAccessDays = Math.max(1, Math.floor(data.defaultAccessDays));

  if (isMockMode()) {
    mockStore.platformSettings = {
      whatsappNumber,
      defaultAccessDays,
      paymentInstructions,
    };
    revalidatePath("/admin/settings");
    revalidatePath("/dashboard/buy");
    return { success: true };
  }

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: { whatsappNumber, defaultAccessDays, paymentInstructions },
    create: {
      id: "default",
      whatsappNumber,
      defaultAccessDays,
      paymentInstructions,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/buy");
  return { success: true };
}

export async function saveBankAccount(data: {
  id?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  active: boolean;
  sortOrder: number;
}) {
  await requireAdmin();

  const bankName = data.bankName.trim();
  const accountTitle = data.accountTitle.trim();
  const accountNumber = data.accountNumber.trim();
  const iban = data.iban.trim() || null;

  if (!bankName || !accountTitle || !accountNumber) {
    throw new Error("Bank name, account title, and account number are required");
  }

  if (isMockMode()) {
    if (data.id) {
      const account = mockStore.bankAccounts.find((b) => b.id === data.id);
      if (!account) throw new Error("Bank account not found");
      Object.assign(account, {
        bankName,
        accountTitle,
        accountNumber,
        iban,
        active: data.active,
        sortOrder: data.sortOrder,
      });
    } else {
      mockStore.bankAccounts.push({
        id: mockId("bank"),
        bankName,
        accountTitle,
        accountNumber,
        iban,
        active: data.active,
        sortOrder: data.sortOrder,
        createdAt: new Date(),
      });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/dashboard/buy");
    return { success: true };
  }

  if (data.id) {
    await prisma.bankAccount.update({
      where: { id: data.id },
      data: {
        bankName,
        accountTitle,
        accountNumber,
        iban,
        active: data.active,
        sortOrder: data.sortOrder,
      },
    });
  } else {
    await prisma.bankAccount.create({
      data: {
        bankName,
        accountTitle,
        accountNumber,
        iban,
        active: data.active,
        sortOrder: data.sortOrder,
      },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/buy");
  return { success: true };
}

export async function deleteBankAccount(id: string) {
  await requireAdmin();

  if (isMockMode()) {
    const idx = mockStore.bankAccounts.findIndex((b) => b.id === id);
    if (idx < 0) throw new Error("Bank account not found");
    const hasOrders = mockStore.paymentOrders.some((o) => o.bankAccountId === id);
    if (hasOrders) {
      throw new Error("Cannot delete a bank account that has payment orders");
    }
    mockStore.bankAccounts.splice(idx, 1);
    revalidatePath("/admin/settings");
    return { success: true };
  }

  const orderCount = await prisma.paymentOrder.count({
    where: { bankAccountId: id },
  });
  if (orderCount > 0) {
    throw new Error("Cannot delete a bank account that has payment orders");
  }

  await prisma.bankAccount.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { success: true };
}
