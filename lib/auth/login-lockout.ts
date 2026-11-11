import { prisma } from "@/lib/prisma";

export function maxFailedLogins(): number {
  const n = Number(process.env.AUTH_MAX_FAILED_LOGINS ?? "5");
  return Number.isFinite(n) && n >= 3 ? Math.floor(n) : 5;
}

export const LOCKED_ACCOUNT_MESSAGE =
  "Your account is locked after too many failed login attempts. Please contact an administrator to unblock it.";

/**
 * Record a failed password attempt. Locks the account when the limit is reached.
 * Returns whether the account is now locked.
 */
export async function recordFailedLogin(userId: string): Promise<{
  locked: boolean;
  failedLoginCount: number;
}> {
  const max = maxFailedLogins();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginCount: true, status: true, role: true },
  });
  if (!user) return { locked: false, failedLoginCount: 0 };
  // Never auto-lock admin accounts via brute force on this path — admins use separate portal
  // but same authorize(); still allow lock for USER only.
  if (user.role === "ADMIN") {
    return { locked: false, failedLoginCount: user.failedLoginCount };
  }
  if (user.status === "LOCKED" || user.status === "SUSPENDED") {
    return { locked: user.status === "LOCKED", failedLoginCount: user.failedLoginCount };
  }

  const next = user.failedLoginCount + 1;
  if (next >= max) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: next,
        status: "LOCKED",
        lockedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    });
    const { revokeProxySessions } = await import("@/lib/session-service/client");
    await revokeProxySessions({ userId });
    return { locked: true, failedLoginCount: next };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: next },
  });
  return { locked: false, failedLoginCount: next };
}

export async function clearFailedLogins(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: 0, lockedAt: null },
  });
}
