import {
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "crypto";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.SESSION_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_ENCRYPTION_KEY is required");
  }
  return scryptSync(secret, "groupbuy-tools-salt", 32);
}

export function decryptCookieData(payload: string): string {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted cookie payload");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

export type StoredCookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expirationDate?: number;
};

export function parseCookies(payload: string): StoredCookie[] {
  const raw = decryptCookieData(payload);
  const cookies = JSON.parse(raw) as StoredCookie[];
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error("Invalid cookie JSON");
  }
  return cookies;
}

export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function pickCloudAccount(toolId: string) {
  const accounts = await prisma.toolAccount.findMany({
    where: {
      toolId,
      active: true,
      healthStatus: { not: "EXPIRED" },
    },
    orderBy: { createdAt: "asc" },
  });
  return accounts[0] ?? null;
}

export async function assertUserToolAccess(userId: string, toolId: string) {
  const now = new Date();
  const access = await prisma.userToolAccess.findUnique({
    where: { userId_toolId: { userId, toolId } },
  });
  if (
    !access ||
    access.status !== "ACTIVE" ||
    (access.expiresAt && access.expiresAt < now)
  ) {
    return false;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  return Boolean(user && user.status !== "SUSPENDED");
}
