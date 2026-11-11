import { Role, UserStatus } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import {
  authCookieDomain,
  authSessionMaxAgeSec,
  authSessionUpdateAgeSec,
  bumpUserSessionVersion,
  getClientIp,
} from "@/lib/auth/session-security";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "default_dev_secret_orbyt_rush_super_secure_key_123",
  session: {
    strategy: "jwt",
    maxAge: authSessionMaxAgeSec(),
    updateAge: authSessionUpdateAgeSec(),
  },
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: (() => {
    const domain = authCookieDomain();
    if (!domain) return undefined;
    const secure = process.env.NODE_ENV === "production";
    const prefix = secure ? "__Secure-" : "";
    return {
      sessionToken: {
        name: `${prefix}next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
          domain,
        },
      },
      callbackUrl: {
        name: `${prefix}next-auth.callback-url`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
          domain,
        },
      },
      csrfToken: {
        name: `${secure ? "__Host-" : ""}next-auth.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
        },
      },
    };
  })(),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();
        const loginIp = getClientIp(
          // NextAuth v4 passes a request-like object with headers
          (req as { headers?: Headers | Record<string, string | string[]> })
            ?.headers
        );
        const headers = (
          req as { headers?: Headers | Record<string, string | string[]> }
        )?.headers;
        let userAgent: string | null = null;
        if (headers && typeof (headers as Headers).get === "function") {
          userAgent = (headers as Headers).get("user-agent");
        } else if (headers && typeof headers === "object") {
          const ua = (headers as Record<string, string | string[]>)[
            "user-agent"
          ];
          userAgent = Array.isArray(ua) ? ua[0] : ua ?? null;
        }

        if (isMockMode()) {
          const mockUser = mockStore.users.find(
            (u) => u.email === normalizedEmail
          );
          if (!mockUser || mockUser.password !== password) {
            return null;
          }
          if (mockUser.status === "SUSPENDED") {
            throw new Error("SUSPENDED_ACCOUNT");
          }
          const sessionVersion =
            ((mockUser as { sessionVersion?: number }).sessionVersion ?? 0) + 1;
          (mockUser as { sessionVersion?: number }).sessionVersion =
            sessionVersion;
          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            status: mockUser.status,
            sessionVersion,
            loginIp: loginIp ?? undefined,
          };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            return null;
          }

          if (user.status === "SUSPENDED") {
            throw new Error("SUSPENDED_ACCOUNT");
          }
          if (user.status === "LOCKED") {
            throw new Error("LOCKED_ACCOUNT");
          }

          const bcrypt = await import("bcrypt");
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            const { recordFailedLogin } = await import(
              "@/lib/auth/login-lockout"
            );
            const { recordFailedLoginEvent } = await import(
              "@/lib/auth/login-audit"
            );
            const result = await recordFailedLogin(user.id);
            void recordFailedLoginEvent({
              userId: user.id,
              ip: loginIp,
              userAgent,
              reason: result.locked ? "LOCKED_OUT" : "FAILED_PASSWORD",
            });
            if (result.locked) {
              throw new Error("LOCKED_ACCOUNT");
            }
            return null;
          }

          const previousIp = user.lastLoginIp;

          // New login → bump sessionVersion (kicks every other device/IP) + clear lockout counter.
          const { clearFailedLogins } = await import("@/lib/auth/login-lockout");
          await clearFailedLogins(user.id);

          const updated = await bumpUserSessionVersion(user.id, {
            touchLogin: true,
            lastLoginIp: loginIp,
          });

          const { recordSuccessfulLogin } = await import(
            "@/lib/auth/login-audit"
          );
          void recordSuccessfulLogin({
            userId: updated.id,
            email: user.email,
            name: user.name,
            ip: loginIp,
            userAgent,
            previousIp,
          });

          return {
            id: updated.id,
            name: user.name,
            email: user.email,
            role: updated.role,
            status: updated.status,
            sessionVersion: updated.sessionVersion,
            loginIp: loginIp ?? undefined,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (
            msg === "SUSPENDED_ACCOUNT" ||
            msg === "LOCKED_ACCOUNT"
          ) {
            throw err;
          }
          console.error("[auth] login database error:", err);
          throw new Error(
            "Database unavailable. Check DATABASE_URL / Supabase network access."
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.sessionVersion =
          typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
        token.loginIp =
          typeof user.loginIp === "string" ? user.loginIp : undefined;
        token.sessionCheckedAt = Date.now();
        return token;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      const userId = typeof token.id === "string" ? token.id : null;
      if (!userId || isMockMode()) {
        return token;
      }

      // Re-check DB on schedule (and on explicit session update) so kick/suspend apply fast.
      const checkedAt =
        typeof token.sessionCheckedAt === "number" ? token.sessionCheckedAt : 0;
      const due =
        trigger === "update" ||
        Date.now() - checkedAt >= authSessionUpdateAgeSec() * 1000;

      if (!due) {
        return token;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            status: true,
            role: true,
            sessionVersion: true,
            lastLoginIp: true,
          },
        });

        if (!dbUser || dbUser.status === "SUSPENDED" || dbUser.status === "LOCKED") {
          return {
            ...token,
            error: "SessionInvalid",
            status: dbUser?.status ?? "SUSPENDED",
          };
        }

        const tokenVersion =
          typeof token.sessionVersion === "number" ? token.sessionVersion : -1;
        if (dbUser.sessionVersion !== tokenVersion) {
          // Another device logged in (or password changed / admin kick).
          return { ...token, error: "SessionSuperseded" };
        }

        token.status = dbUser.status;
        token.role = dbUser.role;
        token.sessionVersion = dbUser.sessionVersion;
        token.sessionCheckedAt = Date.now();
      } catch {
        /* keep token if DB briefly unavailable */
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "SessionSuperseded" || token.error === "SessionInvalid") {
        // Signal client/middleware that this session is dead.
        session.user = {
          ...session.user,
          id: "",
          role: "USER",
          status: "SUSPENDED",
        };
        (session as { error?: string }).error = String(token.error);
        return session;
      }

      if (session.user) {
        session.user.id =
          (typeof token.id === "string" && token.id) ||
          (typeof token.sub === "string" ? token.sub : "");
        session.user.role = (token.role as Role | undefined) ?? "USER";
        session.user.status =
          (token.status as UserStatus | undefined) ?? "ACTIVE";
        session.user.sessionVersion =
          typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
        session.user.loginIp =
          typeof token.loginIp === "string" ? token.loginIp : null;
      }
      return session;
    },
  },
};
