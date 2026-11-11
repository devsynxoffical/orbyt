import { prisma } from "@/lib/prisma";
import { normalizeIp } from "@/lib/auth/session-security";
import { isEmailConfigured, sendSuspiciousLoginEmail } from "@/lib/email";

function briefUa(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  const s = ua.slice(0, 180);
  if (/iPhone|iPad/i.test(s)) return "Apple iPhone/iPad";
  if (/Android/i.test(s)) return "Android device";
  if (/Windows/i.test(s)) return "Windows browser";
  if (/Mac OS|Macintosh/i.test(s)) return "Mac browser";
  if (/Linux/i.test(s)) return "Linux browser";
  return s;
}

function uaFamily(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  if (/iPhone|iPad/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS|Macintosh/i.test(ua)) return "mac";
  if (/Linux/i.test(ua)) return "linux";
  return "other";
}

export type RecordLoginInput = {
  userId: string;
  email: string;
  name: string;
  ip: string | null;
  userAgent: string | null;
  /** Previous login IP from User.lastLoginIp before this login updated it */
  previousIp: string | null;
};

/**
 * Persist a successful login row and email the user if the IP/device looks new.
 * Never throws — login must not fail because of audit/email issues.
 */
export async function recordSuccessfulLogin(input: RecordLoginInput) {
  try {
    const ip = normalizeIp(input.ip);
    const prevIp = normalizeIp(input.previousIp);

    const recent = await prisma.loginEvent.findMany({
      where: { userId: input.userId, success: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { ip: true, userAgent: true },
    });

    const seenIps = new Set(
      recent.map((e) => normalizeIp(e.ip)).filter(Boolean) as string[]
    );
    const seenFamilies = new Set(recent.map((e) => uaFamily(e.userAgent)));

    const isFirstLogin = recent.length === 0;
    const newIp = Boolean(ip && prevIp && ip !== prevIp) || Boolean(ip && !seenIps.has(ip) && !isFirstLogin);
    const newDevice =
      !isFirstLogin &&
      Boolean(input.userAgent) &&
      !seenFamilies.has(uaFamily(input.userAgent));

    let reason: string | null = null;
    let suspicious = false;
    if (!isFirstLogin && newIp && newDevice) {
      suspicious = true;
      reason = "NEW_IP_AND_DEVICE";
    } else if (!isFirstLogin && newIp) {
      suspicious = true;
      reason = "NEW_IP";
    } else if (!isFirstLogin && newDevice) {
      suspicious = true;
      reason = "NEW_DEVICE";
    } else if (!isFirstLogin && prevIp && ip && ip !== prevIp) {
      // session kick from different place even if IP seen before long ago
      suspicious = true;
      reason = "IP_CHANGED";
    }

    // Every successful login after the first that replaces another session is worth noting
    // when IP differs — already covered above.

    await prisma.loginEvent.create({
      data: {
        userId: input.userId,
        ip,
        userAgent: input.userAgent?.slice(0, 500) ?? null,
        success: true,
        suspicious,
        reason: reason ?? (isFirstLogin ? "FIRST_LOGIN" : "LOGIN"),
      },
    });

    if (suspicious && isEmailConfigured()) {
      const when = new Date().toUTCString();
      const adminCc = process.env.SECURITY_ALERT_EMAIL?.trim();
      void sendSuspiciousLoginEmail({
        to: input.email,
        name: input.name,
        ip: ip ?? "unknown",
        device: briefUa(input.userAgent),
        when,
        reason: reason ?? "NEW_LOGIN",
        cc: adminCc,
      }).catch((err) => {
        console.error("[login-audit] suspicious email failed", err);
      });
    }
  } catch (err) {
    console.error("[login-audit] recordSuccessfulLogin failed", err);
  }
}

export async function recordFailedLoginEvent(params: {
  userId: string;
  ip: string | null;
  userAgent: string | null;
  reason: "FAILED_PASSWORD" | "LOCKED_OUT";
}) {
  try {
    await prisma.loginEvent.create({
      data: {
        userId: params.userId,
        ip: normalizeIp(params.ip),
        userAgent: params.userAgent?.slice(0, 500) ?? null,
        success: false,
        suspicious: params.reason === "LOCKED_OUT",
        reason: params.reason,
      },
    });
  } catch (err) {
    console.error("[login-audit] recordFailedLoginEvent failed", err);
  }
}

export async function getUserLoginEvents(userId: string, take = 50) {
  return prisma.loginEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function countDistinctLoginIps(userId: string) {
  const rows = await prisma.loginEvent.findMany({
    where: { userId, success: true, ip: { not: null } },
    select: { ip: true },
    distinct: ["ip"],
  });
  return rows.length;
}
