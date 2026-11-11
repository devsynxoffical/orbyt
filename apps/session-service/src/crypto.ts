import {
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "crypto";

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

export type StoredCookie = { name: string; value: string };

export function cookiesToHeaderString(cookies: StoredCookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

export function decryptCookiesToHeader(payload: string): string {
  const raw = decryptCookieData(payload);
  const cookies = JSON.parse(raw) as StoredCookie[];
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error("Invalid cookie JSON");
  }
  for (const c of cookies) {
    if (!c || typeof c.name !== "string" || typeof c.value !== "string") {
      throw new Error("Invalid cookie entry");
    }
  }
  return cookiesToHeaderString(cookies);
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
