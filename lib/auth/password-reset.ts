import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { isMockMode } from "@/lib/config";
import {
  buildPasswordResetUrl,
  isEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/email";
import { mockId, mockStore } from "@/lib/mock/store";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Always returns a generic success payload so callers cannot enumerate emails.
 * When SMTP is configured, emails a reset link. In mock / without SMTP, logs the link.
 */
export async function requestPasswordReset(email: string): Promise<{
  ok: true;
  debugResetUrl?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  const resetUrl = buildPasswordResetUrl(rawToken);

  let userName: string | null = null;
  let userEmail: string | null = null;

  if (isMockMode()) {
    const user = mockStore.users.find((u) => u.email === normalizedEmail);
    if (user && user.status === "ACTIVE") {
      mockStore.passwordResetTokens = mockStore.passwordResetTokens.filter(
        (t) => t.userId !== user.id || t.usedAt
      );
      mockStore.passwordResetTokens.push({
        id: mockId("reset"),
        tokenHash,
        userId: user.id,
        expiresAt,
        usedAt: null,
        createdAt: new Date(),
      });
      userName = user.name;
      userEmail = user.email;
    }
  } else {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, status: true },
    });

    if (user && user.status === "ACTIVE") {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });
      userName = user.name;
      userEmail = user.email;
    }
  }

  if (userEmail && userName) {
    if (isEmailConfigured()) {
      try {
        await sendPasswordResetEmail({
          to: userEmail,
          name: userName,
          resetUrl,
        });
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : "Unknown email error";
        console.error("[password-reset] Failed to send email:", detail, err);
        throw new Error(
          `Email delivery failed: ${detail}. Check SMTP settings and that EMAIL_FROM uses a verified Resend domain.`
        );
      }
    } else {
      console.info(
        `[password-reset] Email not configured. Reset link for ${userEmail}: ${resetUrl}`
      );
    }
  }

  return {
    ok: true,
    ...(process.env.NODE_ENV !== "production" && userEmail
      ? { debugResetUrl: resetUrl }
      : {}),
  };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const tokenHash = hashToken(token);
  const now = new Date();

  if (isMockMode()) {
    const record = mockStore.passwordResetTokens.find(
      (t) => t.tokenHash === tokenHash && !t.usedAt
    );
    if (!record || record.expiresAt < now) {
      return { ok: false, error: "This reset link is invalid or has expired." };
    }

    const user = mockStore.users.find((u) => u.id === record.userId);
    if (!user || user.status !== "ACTIVE") {
      return { ok: false, error: "This reset link is invalid or has expired." };
    }

    user.password = newPassword;
    record.usedAt = now;
    return { ok: true };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, status: true } } },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt < now ||
    record.user.status !== "ACTIVE"
  ) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: record.userId,
        usedAt: null,
        id: { not: record.id },
      },
    }),
  ]);

  return { ok: true };
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const now = new Date();

  if (isMockMode()) {
    const record = mockStore.passwordResetTokens.find(
      (t) => t.tokenHash === tokenHash && !t.usedAt
    );
    return Boolean(record && record.expiresAt >= now);
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, usedAt: true },
  });

  return Boolean(record && !record.usedAt && record.expiresAt >= now);
}
