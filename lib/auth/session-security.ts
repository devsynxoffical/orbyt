/**
 * Account-sharing / session security helpers.
 *
 * Policy:
 * - One active Orbyt Rush login per user (sessionVersion bump kicks other devices)
 * - Login IP stored in JWT; mid-session IP change forces re-login (USER role)
 * - Suspend / password change bumps sessionVersion so old JWTs die quickly
 */

export function authSessionMaxAgeSec(): number {
  const n = Number(process.env.AUTH_SESSION_MAX_AGE_SEC ?? String(12 * 60 * 60));
  return Number.isFinite(n) && n > 60 ? Math.floor(n) : 12 * 60 * 60;
}

export function authSessionUpdateAgeSec(): number {
  const n = Number(process.env.AUTH_SESSION_UPDATE_AGE_SEC ?? "60");
  return Number.isFinite(n) && n >= 30 ? Math.floor(n) : 60;
}

/** Strict IP binding for normal users (admins exempt unless AUTH_STRICT_IP_ADMIN=true). */
export function authStrictIpEnabled(): boolean {
  const v = (process.env.AUTH_STRICT_IP ?? "true").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function authStrictIpForAdmin(): boolean {
  const v = (process.env.AUTH_STRICT_IP_ADMIN ?? "false").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function authCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;
  const fromEnv = process.env.NEXTAUTH_COOKIE_DOMAIN?.trim();
  if (fromEnv) return fromEnv;
  // Do NOT guess cookie domain from NEXTAUTH_URL: when browsing via railway.app
  // or alternative preview domains, a hardcoded domain causes browsers to reject cookies.
  // Leaving undefined allows cookies to be host-only and work on all domains.
  return undefined;
}

type HeaderBag =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

function headerGet(headers: HeaderBag, name: string): string | undefined {
  if (!headers) return undefined;
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name) ?? undefined;
  }
  const rec = headers as Record<string, string | string[] | undefined>;
  const direct = rec[name] ?? rec[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return direct;
}

/** Best-effort client IP behind Nginx / Cloudflare. */
export function getClientIp(headers: HeaderBag): string | null {
  const cf = headerGet(headers, "cf-connecting-ip")?.trim();
  if (cf) return cf.split(",")[0].trim();

  const real = headerGet(headers, "x-real-ip")?.trim();
  if (real) return real.split(",")[0].trim();

  const fwd = headerGet(headers, "x-forwarded-for")?.trim();
  if (fwd) return fwd.split(",")[0].trim();

  return null;
}

export function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const t = ip.trim().toLowerCase();
  if (!t) return null;
  // Strip IPv6-mapped IPv4
  if (t.startsWith("::ffff:")) return t.slice(7);
  return t;
}

export function ipsMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const na = normalizeIp(a);
  const nb = normalizeIp(b);
  if (!na || !nb) return true; // cannot compare → do not lock out
  return na === nb;
}

export async function bumpUserSessionVersion(
  userId: string,
  extra?: { lastLoginIp?: string | null; touchLogin?: boolean }
) {
  const { prisma } = await import("@/lib/prisma");
  const data: {
    sessionVersion: { increment: number };
    lastLoginAt?: Date;
    lastLoginIp?: string | null;
  } = {
    sessionVersion: { increment: 1 },
  };
  if (extra?.touchLogin) {
    data.lastLoginAt = new Date();
    if (extra.lastLoginIp !== undefined) {
      data.lastLoginIp = extra.lastLoginIp;
    }
  }
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      sessionVersion: true,
      status: true,
      role: true,
      lastLoginIp: true,
    },
  });
}
