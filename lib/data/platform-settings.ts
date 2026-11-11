import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

export type PlatformSettingsView = {
  whatsappNumber: string | null;
  defaultAccessDays: number;
  paymentInstructions: string | null;
};

const DEFAULTS: PlatformSettingsView = {
  whatsappNumber: null,
  defaultAccessDays: 30,
  paymentInstructions: null,
};

export async function getPlatformSettings(): Promise<PlatformSettingsView> {
  if (isMockMode()) {
    return { ...mockStore.platformSettings };
  }

  const row = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  if (!row) return DEFAULTS;

  return {
    whatsappNumber: row.whatsappNumber,
    defaultAccessDays: row.defaultAccessDays,
    paymentInstructions: row.paymentInstructions,
  };
}
