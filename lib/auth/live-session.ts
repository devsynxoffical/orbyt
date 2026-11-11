import { redirect } from "next/navigation";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/config";

export type LiveSession = {
  session: Session;
  userId: string;
  role: Session["user"]["role"];
  status: Session["user"]["status"];
};

/**
 * Validates NextAuth session against DB (status + sessionVersion).
 * Returns null if the session was kicked, expired, or suspended.
 */
export async function getLiveSession(): Promise<LiveSession | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId || (session as Session & { error?: string }).error) {
    return null;
  }

  if (isMockMode()) {
    return {
      session,
      userId,
      role: session.user.role,
      status: session.user.status,
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, role: true, sessionVersion: true },
    });

    if (!dbUser || dbUser.status === "SUSPENDED" || dbUser.status === "LOCKED") {
      return null;
    }

    const tokenVersion = session.user.sessionVersion;
    if (
      typeof tokenVersion === "number" &&
      dbUser.sessionVersion !== tokenVersion
    ) {
      return null;
    }

    return {
      session,
      userId,
      role: dbUser.role,
      status: dbUser.status,
    };
  } catch (err) {
    console.error("[auth] live session DB check failed", err);
    // Don't crash RSC (Railway/Supabase IP blocks). Trust JWT until DB is back.
    return {
      session,
      userId,
      role: session.user.role,
      status: session.user.status,
    };
  }
}

export async function requireLiveUserPage(loginPath = "/login") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(loginPath);
  }

  const live = await getLiveSession();
  if (!live) {
    const err =
      (session as Session & { error?: string }).error === "SessionInvalid"
        ? "sessionExpired"
        : "sessionTaken";
    redirect(`${loginPath}?error=${err}`);
  }
  if (live.status === "SUSPENDED" || live.status === "LOCKED") {
    redirect("/account-suspended");
  }
  return live;
}
