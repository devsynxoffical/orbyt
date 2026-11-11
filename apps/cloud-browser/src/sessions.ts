import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
  type CDPSession,
} from "playwright";
import type { WebSocket as WsSocket } from "ws";
import type { StoredCookie } from "./db.js";

export type CloudSession = {
  id: string;
  token: string;
  userId: string;
  toolId: string;
  toolAccountId: string;
  openUrl: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  cdp: CDPSession | null;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
  sockets: Set<WsSocket>;
};

const sessions = new Map<string, CloudSession>();

function maxSessions() {
  const n = Number(process.env.CLOUD_BROWSER_MAX_SESSIONS ?? "3");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
}

function idleMs() {
  const n = Number(process.env.CLOUD_BROWSER_IDLE_MS ?? String(10 * 60 * 1000));
  return Number.isFinite(n) && n > 0 ? n : 10 * 60 * 1000;
}

function ttlMs() {
  const n = Number(process.env.CLOUD_BROWSER_TTL_MS ?? String(30 * 60 * 1000));
  return Number.isFinite(n) && n > 0 ? n : 30 * 60 * 1000;
}

function registrableDomain(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
}

function mapSameSite(
  raw: string | undefined,
  secure: boolean
): "Strict" | "Lax" | "None" | undefined {
  const v = (raw || "").toLowerCase();
  if (v === "strict") return "Strict";
  if (v === "lax") return "Lax";
  if (v === "none" || v === "no_restriction") return "None";
  if (v === "unspecified" || !v) return secure ? "None" : "Lax";
  return undefined;
}

function normalizeExpires(expirationDate: unknown): number | undefined {
  if (typeof expirationDate !== "number" || !Number.isFinite(expirationDate)) {
    return undefined;
  }
  // Chrome uses seconds; some exports use milliseconds.
  let exp = expirationDate > 1e12 ? expirationDate / 1000 : expirationDate;
  exp = Math.floor(exp);
  // Session / already-expired → omit (Playwright treats missing expires as session).
  if (exp <= 0 || exp <= Date.now() / 1000) return undefined;
  return exp;
}

type PlaywrightCookie = {
  name: string;
  value: string;
  url?: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

function toPlaywrightCookies(
  cookies: StoredCookie[],
  openUrl: string
): PlaywrightCookie[] {
  let origin: string;
  let fallbackDomain: string;
  try {
    const u = new URL(openUrl);
    origin = u.origin;
    fallbackDomain = `.${registrableDomain(u.hostname)}`;
  } catch {
    return [];
  }

  const out: PlaywrightCookie[] = [];

  for (const c of cookies) {
    const name = typeof c.name === "string" ? c.name.trim() : "";
    if (!name) continue;
    const value = c.value == null ? "" : String(c.value);

    const isHost = name.startsWith("__Host-");
    const isSecureName = name.startsWith("__Secure-") || isHost;

    let secure = c.secure === true || isSecureName;
    const sameSite = mapSameSite(c.sameSite, secure || c.secure !== false);
    if (sameSite === "None") secure = true;
    if (isSecureName) secure = true;

    const expires = normalizeExpires(c.expirationDate);
    const path =
      typeof c.path === "string" && c.path.startsWith("/") ? c.path : "/";
    const httpOnly = Boolean(c.httpOnly);

    const base: PlaywrightCookie = {
      name,
      value,
      path: isHost ? "/" : path,
      secure,
      httpOnly,
      ...(expires !== undefined ? { expires } : {}),
      ...(sameSite ? { sameSite } : {}),
    };

    // __Host- cookies must not include Domain; set via URL only.
    if (isHost) {
      out.push({ ...base, url: `${origin}/`, path: "/", secure: true });
      continue;
    }

    const rawDomain =
      typeof c.domain === "string"
        ? c.domain.trim().replace(/^\./, "").split(":")[0]
        : "";

    // Use domain+path only (not url+domain together — CDP rejects that combo often).
    out.push({
      ...base,
      domain: `.${registrableDomain(rawDomain || fallbackDomain.replace(/^\./, ""))}`,
    });
  }

  return out;
}

async function addCookiesSafely(
  context: BrowserContext,
  cookies: PlaywrightCookie[]
) {
  if (cookies.length === 0) return { ok: 0, fail: 0 };
  let ok = 0;
  let fail = 0;
  // One-by-one so a single bad Chrome export field does not abort the session.
  for (const cookie of cookies) {
    try {
      await context.addCookies([cookie]);
      ok += 1;
    } catch {
      fail += 1;
      try {
        const { sameSite: _s, expires: _e, ...rest } = cookie;
        await context.addCookies([
          {
            ...rest,
            secure: true,
            sameSite: "None",
          },
        ]);
        ok += 1;
        fail -= 1;
      } catch {
        /* skip invalid cookie */
      }
    }
  }
  if (ok === 0 && cookies.length > 0) {
    throw new Error(
      "Could not apply any session cookies (invalid cookie fields). Re-export cookies from Chrome."
    );
  }
  return { ok, fail };
}

export function sessionCount() {
  return sessions.size;
}

export function getSessionByToken(token: string) {
  return sessions.get(token) ?? null;
}

export async function destroySession(token: string) {
  const s = sessions.get(token);
  if (!s) return;
  sessions.delete(token);
  for (const sock of Array.from(s.sockets)) {
    try {
      sock.close();
    } catch {
      /* ignore */
    }
  }
  try {
    await s.browser.close();
  } catch {
    /* ignore */
  }
}

export async function createCloudSession(params: {
  token: string;
  userId: string;
  toolId: string;
  toolAccountId: string;
  openUrl: string;
  cookies: StoredCookie[];
}): Promise<CloudSession> {
  if (sessions.size >= maxSessions()) {
    throw new Error(
      `Cloud browser at capacity (${maxSessions()} sessions). Try again later or use desktop Chrome.`
    );
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,800",
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    const playwrightCookies = toPlaywrightCookies(
      params.cookies,
      params.openUrl
    );
    await addCookiesSafely(context, playwrightCookies);

    const page = await context.newPage();
    await page.goto(params.openUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    const now = Date.now();
    const session: CloudSession = {
      id: params.token,
      token: params.token,
      userId: params.userId,
      toolId: params.toolId,
      toolAccountId: params.toolAccountId,
      openUrl: params.openUrl,
      browser,
      context,
      page,
      cdp: null,
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + ttlMs(),
      sockets: new Set(),
    };

    sessions.set(params.token, session);
    return session;
  } catch (err) {
    try {
      await browser.close();
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export function touchSession(session: CloudSession) {
  session.lastActiveAt = Date.now();
}

export async function attachScreencast(
  session: CloudSession,
  ws: WsSocket
) {
  touchSession(session);
  session.sockets.add(ws);

  if (!session.cdp) {
    session.cdp = await session.page.context().newCDPSession(session.page);
    await session.cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 60,
      maxWidth: 1280,
      maxHeight: 800,
      everyNthFrame: 1,
    });

    session.cdp.on("Page.screencastFrame", async (frame) => {
      const payload = JSON.stringify({
        type: "frame",
        data: frame.data,
        sessionId: frame.sessionId,
        metadata: frame.metadata,
      });
      for (const sock of Array.from(session.sockets)) {
        if (sock.readyState === sock.OPEN) {
          sock.send(payload);
        }
      }
      try {
        await session.cdp?.send("Page.screencastFrameAck", {
          sessionId: frame.sessionId,
        });
      } catch {
        /* ignore */
      }
    });
  }

  ws.on("message", async (raw) => {
    touchSession(session);
    let msg: {
      type?: string;
      x?: number;
      y?: number;
      button?: string;
      text?: string;
      key?: string;
      code?: string;
      deltaY?: number;
    };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (!session.cdp) return;

    try {
      if (msg.type === "mousedown" || msg.type === "mouseup" || msg.type === "mousemove") {
        await session.cdp.send("Input.dispatchMouseEvent", {
          type:
            msg.type === "mousedown"
              ? "mousePressed"
              : msg.type === "mouseup"
                ? "mouseReleased"
                : "mouseMoved",
          x: msg.x ?? 0,
          y: msg.y ?? 0,
          button: (msg.button as "left" | "none") || "left",
          clickCount: 1,
        });
      } else if (msg.type === "wheel") {
        await session.cdp.send("Input.dispatchMouseEvent", {
          type: "mouseWheel",
          x: msg.x ?? 0,
          y: msg.y ?? 0,
          deltaX: 0,
          deltaY: msg.deltaY ?? 0,
        });
      } else if (msg.type === "keydown" || msg.type === "keyup") {
        await session.cdp.send("Input.dispatchKeyEvent", {
          type: msg.type === "keydown" ? "keyDown" : "keyUp",
          text: msg.text,
          key: msg.key,
          code: msg.code,
        });
      } else if (msg.type === "char" && msg.text) {
        await session.cdp.send("Input.dispatchKeyEvent", {
          type: "char",
          text: msg.text,
        });
      }
    } catch {
      /* ignore input errors */
    }
  });

  ws.on("close", () => {
    session.sockets.delete(ws);
  });
}

export function startJanitor() {
  setInterval(() => {
    const now = Date.now();
    const idle = idleMs();
    for (const [token, s] of Array.from(sessions.entries())) {
      if (now > s.expiresAt || now - s.lastActiveAt > idle) {
        void destroySession(token);
      }
    }
  }, 30_000).unref();
}
