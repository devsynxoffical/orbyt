import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

export type BankAccountView = {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string | null;
  active: boolean;
  sortOrder: number;
};

export async function getAllBankAccounts(): Promise<BankAccountView[]> {
  if (isMockMode()) {
    return [...mockStore.bankAccounts].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return prisma.bankAccount.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getActiveBankAccounts(): Promise<BankAccountView[]> {
  const all = await getAllBankAccounts();
  return all.filter((b) => b.active);
}

export async function getBankAccountById(
  id: string
): Promise<BankAccountView | null> {
  if (isMockMode()) {
    return mockStore.bankAccounts.find((b) => b.id === id) ?? null;
  }

  return prisma.bankAccount.findUnique({ where: { id } });
}
