import "dotenv/config";
import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { randomBytes } from "crypto";
import { generateToken, decryptCookiesToHeader } from "./crypto.js";
import {
  prisma,
  pickToolAccount,
  createLaunchToken,
  consumeLaunchToken,
  logLaunch,
  cleanupExpiredTokens,
  createPersistedProxySession,
  getPersistedProxySession,
  touchAccessCheck,
  revokeSessions,
  verifyUserStillHasAccess,
  getAccountLoad,
  countLiveSessionsForAccount,
} from "./db.js";
import {
  cacheProxySession,
  getCachedProxySession,
  dropCachedProxySession,
  dropCachedSessionsMatching,
  proxyRequest,
  type ProxySession,
} from "./proxy.js";
import {
  assertResolvablePublicHost,
  assertSafeUpstreamUrl,
  hostsFromLaunchUrl,
} from "./url-allowlist.js";
import { probeCookieSession } from "./health.js";

// Railway injects PORT; VPS/PM2 uses SESSION_SERVICE_PORT (default 4000).
const PORT = Number(
  process.env.PORT ?? process.env.SESSION_SERVICE_PORT ?? 4000
);
const API_KEY = process.env.SESSION_SERVICE_API_KEY ?? "";
const PUBLIC_URL = (
  process.env.SESSION_SERVICE_PUBLIC_URL ?? `http://localhost:${PORT}`
).replace(/\/$/, "");
const TOOLS_BASE_DOMAIN = (
  process.env.SESSION_TOOLS_BASE_DOMAIN ?? ""
).toLowerCase().replace(/^\./, "");
const COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN || undefined;
const ACCESS_RECHECK_MS = 60_000;

function requireApiKey(apiKey: string | undefined) {
  if (!API_KEY || apiKey !== API_KEY) {
    throw new Error("Unauthorized");
  }
}

function isSecurePublicUrl() {
  return PUBLIC_URL.startsWith("https://");
}

function toolPublicBase(toolSlug: string, proxySubdomain?: string | null) {
  if (!TOOLS_BASE_DOMAIN) return PUBLIC_URL;
  const sub = (proxySubdomain || toolSlug).toLowerCase();
  const proto = isSecurePublicUrl() ? "https" : "http";
  return `${proto}://${sub}.${TOOLS_BASE_DOMAIN}`;
}

function resolveAllowedHosts(tool: {
  launchUrl: string | null;
  allowedHosts: string[];
}): string[] {
  if (tool.allowedHosts?.length) return tool.allowedHosts;
  if (!tool.launchUrl) return [];
  return hostsFromLaunchUrl(tool.launchUrl);
}

async function loadRuntimeSession(
  sessionId: string | undefined
): Promise<ProxySession | null> {
  if (!sessionId) return null;

  const cached = getCachedProxySession(sessionId);
  if (cached) return cached;

  const row = await getPersistedProxySession(sessionId);
  if (!row) return null;

  const account = await prisma.toolAccount.findUnique({
    where: { id: row.toolAccountId },
  });
  if (!account?.active) {
    await revokeSessions({ sessionId });
    return null;
  }

  let cookieHeader: string;
  try {
    cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
  } catch {
    await revokeSessions({ sessionId });
    return null;
  }

  const tool = await prisma.tool.findUnique({ where: { id: row.toolId } });
  const allowedHosts = tool
    ? resolveAllowedHosts({
        launchUrl: tool.launchUrl,
        allowedHosts: tool.allowedHosts,
      })
    : [];

      const session: ProxySession = {
        id: row.id,
        userId: row.userId,
        toolId: row.toolId,
        toolAccountId: row.toolAccountId,
        toolSlug: row.toolSlug,
        upstream: row.upstreamOrigin,
        cookieHeader,
        allowedHosts,
        expiresAt: row.expiresAt.getTime(),
        // If never checked, treat creation time as last check so the first
        // proxy request after /go does not immediately re-validate/fail.
        lastAccessCheckAt:
          row.lastAccessCheckAt?.getTime() ?? row.createdAt.getTime(),
      };
  cacheProxySession(session);
  return session;
}

async function ensureAccessStillValid(session: ProxySession): Promise<boolean> {
  // Fresh sessions skip the heavy re-check for a short window so the first
  // /proxy hop after /go is not killed by a race or cache miss.
  if (Date.now() - session.lastAccessCheckAt < ACCESS_RECHECK_MS) {
    return true;
  }

  const row = await prisma.proxySession.findUnique({
    where: { id: session.id },
    select: { revokedAt: true, expiresAt: true, createdAt: true },
  });
  if (!row || row.revokedAt || row.expiresAt < new Date()) {
    dropCachedProxySession(session.id);
    return false;
  }

  if (Date.now() - row.createdAt.getTime() < ACCESS_RECHECK_MS) {
    session.lastAccessCheckAt = Date.now();
    cacheProxySession(session);
    return true;
  }

  const ok = await verifyUserStillHasAccess(session.userId, session.toolId);
  if (!ok) {
    await revokeSessions({ sessionId: session.id });
    dropCachedProxySession(session.id);
    return false;
  }
  session.lastAccessCheckAt = Date.now();
  cacheProxySession(session);
  touchAccessCheck(session.id).catch(() => undefined);
  return true;
}

const fastify = Fastify({
  logger: true,
  bodyLimit: 256 * 1024,
});

async function main() {
  await fastify.register(cookie);

  fastify.get("/health", async () => ({ ok: true, service: "session-service" }));

  fastify.post<{
    Body: { userId: string; toolSlug: string; userEmail?: string };
  }>("/internal/launch", async (request, reply) => {
    try {
      requireApiKey(request.headers["x-api-key"] as string | undefined);
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const { userId, toolSlug } = request.body ?? {};
    if (!userId || !toolSlug) {
      return reply.code(400).send({ error: "userId and toolSlug are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });
    if (!user || user.status === "SUSPENDED") {
      return reply.code(403).send({ error: "Account is suspended" });
    }

    const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } });
    if (!tool?.launchUrl || !tool.active) {
      return reply
        .code(400)
        .send({ error: "Tool launch URL is not configured" });
    }

    const accessOk = await verifyUserStillHasAccess(userId, tool.id);
    if (!accessOk) {
      return reply
        .code(403)
        .send({ error: "You do not have access to this tool" });
    }

    let safe: ReturnType<typeof assertSafeUpstreamUrl>;
    try {
      safe = assertSafeUpstreamUrl(tool.launchUrl, {
        allowedHosts:
          tool.allowedHosts.length > 0 ? tool.allowedHosts : undefined,
        allowHttpLocalhost: process.env.NODE_ENV !== "production",
      });
      await assertResolvablePublicHost(safe.url.hostname);
    } catch (err) {
      return reply.code(400).send({
        error:
          err instanceof Error ? err.message : "Unsafe tool launch URL",
      });
    }

    const picked = await pickToolAccount(tool.id);
    if (!picked) {
      return reply
        .code(503)
        .send({ error: "No active tool account available for this tool" });
    }
    if ("full" in picked) {
      return reply.code(503).send({
        error:
          "All tool accounts are currently at capacity. Try again in a few minutes.",
      });
    }
    const account = picked;

    let cookieHeader: string;
    try {
      cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
    } catch {
      return reply.code(503).send({ error: "Tool account cookies are invalid" });
    }

    if (!cookieHeader) {
      return reply.code(503).send({ error: "Tool account has no cookies" });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await createLaunchToken({
      userId,
      toolId: tool.id,
      toolAccountId: account.id,
      token,
      expiresAt,
    });

    await logLaunch({
      userId,
      toolId: tool.id,
      toolAccountId: account.id,
    });

    const base = toolPublicBase(tool.slug, tool.proxySubdomain);
    return {
      launchUrl: `${base}/go/${token}`,
      toolAccountId: account.id,
      expiresAt: expiresAt.toISOString(),
      upstreamHost: safe.url.hostname,
    };
  });

  fastify.post<{ Params: { id: string } }>(
    "/internal/accounts/:id/test",
    async (request, reply) => {
      try {
        requireApiKey(request.headers["x-api-key"] as string | undefined);
      } catch {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const account = await prisma.toolAccount.findUnique({
        where: { id: request.params.id },
        include: { tool: true },
      });
      if (!account) {
        return reply.code(404).send({ error: "Account not found" });
      }
      const fallbackUrlBySlug: Record<string, string> = {
        canva: "https://www.canva.com/",
        "chat-gpt": "https://chatgpt.com/",
        chatgpt: "https://chatgpt.com/",
        claude: "https://claude.ai/new",
        "claude-ai": "https://claude.ai/new",
        grammarly: "https://app.grammarly.com/",
        quillbot: "https://quillbot.com/",
      };
      const effectiveLaunchUrl =
        account.tool.launchUrl ||
        fallbackUrlBySlug[account.tool.slug.toLowerCase()] ||
        null;

      if (!effectiveLaunchUrl) {
        return reply
          .code(400)
          .send({ error: "Tool launch URL is not configured" });
      }

      let cookieHeader: string;
      try {
        cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
      } catch {
        return reply.code(400).send({
          healthStatus: "UNKNOWN",
          message: "Could not decrypt cookies",
        });
      }

      const result = await probeCookieSession({
        launchUrl: effectiveLaunchUrl,
        cookieHeader,
        toolSlug: account.tool.slug,
        launchMode: account.tool.launchMode,
      });

      await prisma.toolAccount.update({
        where: { id: account.id },
        data: {
          healthStatus: result.healthStatus,
          lastHealthCheckAt: new Date(),
          lastHealthError:
            result.healthStatus === "ALIVE" ? null : result.message,
        },
      });

      return result;
    }
  );

  fastify.get<{ Querystring: { toolId?: string } }>(
    "/internal/accounts/load",
    async (request, reply) => {
      try {
        requireApiKey(request.headers["x-api-key"] as string | undefined);
      } catch {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const toolId = request.query.toolId;
      if (!toolId) {
        return reply.code(400).send({ error: "toolId is required" });
      }
      return { accounts: await getAccountLoad(toolId) };
    }
  );

  fastify.post<{
    Body: {
      userId?: string;
      toolId?: string;
      toolAccountId?: string;
      sessionId?: string;
    };
  }>("/internal/sessions/revoke", async (request, reply) => {
    try {
      requireApiKey(request.headers["x-api-key"] as string | undefined);
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const body = request.body ?? {};
    if (!body.userId && !body.toolId && !body.toolAccountId && !body.sessionId) {
      return reply.code(400).send({ error: "Revocation filter required" });
    }

    const result = await revokeSessions(body);
    dropCachedSessionsMatching((s) => {
      if (body.sessionId && s.id === body.sessionId) return true;
      if (body.userId && s.userId === body.userId) {
        if (!body.toolId || s.toolId === body.toolId) return true;
      }
      if (body.toolId && s.toolId === body.toolId && !body.userId) return true;
      if (body.toolAccountId && s.toolAccountId === body.toolAccountId)
        return true;
      return false;
    });

    return { revoked: result.count };
  });

  fastify.get<{ Params: { token: string } }>(
    "/go/:token",
    async (request, reply) => {
      const launch = await consumeLaunchToken(request.params.token);
      if (!launch) {
        return reply
          .code(410)
          .type("text/html")
          .send(
            "<h1>Launch link expired</h1><p>Go back to your dashboard and click Launch again.</p>"
          );
      }

      const stillAllowed = await verifyUserStillHasAccess(
        launch.userId,
        launch.toolId
      );
      if (!stillAllowed) {
        return reply
          .code(403)
          .type("text/html")
          .send(
            "<h1>Access revoked</h1><p>Your access to this tool is no longer active.</p>"
          );
      }

      const [tool, account] = await Promise.all([
        prisma.tool.findUnique({ where: { id: launch.toolId } }),
        prisma.toolAccount.findUnique({ where: { id: launch.toolAccountId } }),
      ]);

      if (!tool?.launchUrl || !account?.active) {
        return reply.code(404).send("Tool session not found");
      }

      if (account.healthStatus === "EXPIRED") {
        return reply
          .code(503)
          .type("text/html")
          .send(
            "<h1>Session cookies expired</h1><p>Ask the admin to refresh this tool account and try again.</p>"
          );
      }

      const live = await countLiveSessionsForAccount(account.id);
      if (live >= account.maxConcurrentUsers) {
        return reply
          .code(503)
          .type("text/html")
          .send(
            "<h1>At capacity</h1><p>All seats for this tool are in use. Try again shortly.</p>"
          );
      }

      let cookieHeader: string;
      try {
        cookieHeader = decryptCookiesToHeader(account.cookieDataEnc);
      } catch {
        return reply.code(503).send("Invalid tool account cookies");
      }

      let safe: ReturnType<typeof assertSafeUpstreamUrl>;
      try {
        safe = assertSafeUpstreamUrl(tool.launchUrl, {
          allowedHosts:
            tool.allowedHosts.length > 0 ? tool.allowedHosts : undefined,
          allowHttpLocalhost: process.env.NODE_ENV !== "production",
        });
      } catch (err) {
        return reply
          .code(400)
          .send(err instanceof Error ? err.message : "Unsafe launch URL");
      }

      const sessionId = randomBytes(24).toString("base64url");
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const upstreamOrigin = safe.url.origin;
      const allowedHosts = resolveAllowedHosts(tool);

      await createPersistedProxySession({
        id: sessionId,
        userId: launch.userId,
        toolId: tool.id,
        toolAccountId: account.id,
        toolSlug: tool.slug,
        upstreamOrigin,
        expiresAt,
      });

      // Soft race guard: if another seat filled between check and create, revoke.
      const liveAfter = await countLiveSessionsForAccount(account.id);
      if (liveAfter > account.maxConcurrentUsers) {
        await revokeSessions({ sessionId });
        return reply
          .code(503)
          .type("text/html")
          .send(
            "<h1>At capacity</h1><p>All seats for this tool are in use. Try again shortly.</p>"
          );
      }

      cacheProxySession({
        id: sessionId,
        userId: launch.userId,
        toolId: tool.id,
        toolAccountId: account.id,
        toolSlug: tool.slug,
        upstream: upstreamOrigin,
        cookieHeader,
        allowedHosts,
        expiresAt: expiresAt.getTime(),
        lastAccessCheckAt: Date.now(),
      });

      reply.setCookie("gb_proxy", sessionId, {
        path: "/",
        httpOnly: true,
        // none+secure so window.open from rankmora.io → session.rankmora.io keeps the cookie
        sameSite: "none",
        secure: true,
        maxAge: 2 * 60 * 60,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      });

      const host = (request.headers.host ?? "").split(":")[0].toLowerCase();
      const onToolHost = Boolean(
        TOOLS_BASE_DOMAIN &&
          host.endsWith(`.${TOOLS_BASE_DOMAIN}`) &&
          host !== TOOLS_BASE_DOMAIN
      );
      return reply.redirect(onToolHost ? "/" : `/proxy/${tool.slug}/`);
    }
  );

  async function handleProxy(
    request: import("fastify").FastifyRequest<{
      Params: { slug: string; "*": string };
    }>,
    reply: import("fastify").FastifyReply
  ) {
    const session = await loadRuntimeSession(
      (request.cookies as { gb_proxy?: string }).gb_proxy
    );
    if (!session || session.toolSlug !== request.params.slug) {
      return reply
        .code(401)
        .type("text/html")
        .send(
          "<h1>Session expired</h1><p>Return to your dashboard and launch the tool again.</p>"
        );
    }

    const allowed = await ensureAccessStillValid(session);
    if (!allowed) {
      return reply
        .code(403)
        .type("text/html")
        .send(
          "<h1>Access revoked</h1><p>Your access ended. Return to the dashboard.</p>"
        );
    }

    const suffix = request.params["*"] ?? "";
    const targetPath = suffix ? `/${suffix}` : "/";

    return new Promise<void>((resolve) => {
      reply.hijack();
      proxyRequest(request.raw, reply.raw, session, targetPath);
      resolve();
    });
  }

  const proxyMethods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ] as const;
  for (const method of proxyMethods) {
    fastify.route<{ Params: { slug: string; "*": string } }>({
      method,
      url: "/proxy/:slug/*",
      handler: handleProxy,
    });
    fastify.route<{ Params: { slug: string } }>({
      method,
      url: "/proxy/:slug",
      handler: async (request, reply) => {
        const session = await loadRuntimeSession(
          (request.cookies as { gb_proxy?: string }).gb_proxy
        );
        if (!session || session.toolSlug !== request.params.slug) {
          return reply.code(401).send("Session expired");
        }
        const allowed = await ensureAccessStillValid(session);
        if (!allowed) return reply.code(403).send("Access revoked");
        return new Promise<void>((resolve) => {
          reply.hijack();
          proxyRequest(request.raw, reply.raw, session, "/");
          resolve();
        });
      },
    });
  }

  // Unmatched paths: tool subdomains OR path-based SPA absolute URLs.
  // Fastify matches routes before onRequest can rewrite URLs, so we handle
  // leftovers here. Many vendor SPAs (e.g. KWS Everywhere) navigate to
  // /dashboard or /api/... and drop the /proxy/:slug prefix — keep proxying
  // when gb_proxy is still valid.
  fastify.setNotFoundHandler(async (request, reply) => {
    const url = request.raw.url ?? "/";
    if (
      url.startsWith("/go/") ||
      url.startsWith("/health") ||
      url.startsWith("/internal/") ||
      url.startsWith("/proxy/")
    ) {
      return reply.code(404).send("Not found");
    }

    const host = (request.headers.host ?? "").split(":")[0].toLowerCase();
    const pathOnly = url.split("?")[0] || "/";
    const targetPath = pathOnly === "/" ? "/" : pathOnly;

    const onToolSubdomain = Boolean(
      TOOLS_BASE_DOMAIN &&
        host.endsWith(`.${TOOLS_BASE_DOMAIN}`) &&
        host !== TOOLS_BASE_DOMAIN
    );

    if (onToolSubdomain) {
      const sub = host.slice(0, -(TOOLS_BASE_DOMAIN.length + 1));
      if (!sub || sub.includes(".")) {
        return reply.code(404).send("Not found");
      }

      const tool = await prisma.tool.findFirst({
        where: {
          OR: [{ proxySubdomain: sub }, { slug: sub }],
          active: true,
        },
      });
      if (!tool) {
        return reply
          .code(404)
          .type("text/html")
          .send("<h1>Unknown tool host</h1>");
      }

      const session = await loadRuntimeSession(
        (request.cookies as { gb_proxy?: string }).gb_proxy
      );
      if (!session || session.toolSlug !== tool.slug) {
        return reply
          .code(401)
          .type("text/html")
          .send(
            "<h1>Session expired</h1><p>Return to your dashboard and launch the tool again.</p>"
          );
      }

      const allowed = await ensureAccessStillValid(session);
      if (!allowed) {
        return reply
          .code(403)
          .type("text/html")
          .send(
            "<h1>Access revoked</h1><p>Your access ended. Return to the dashboard.</p>"
          );
      }

      return new Promise<void>((resolve) => {
        reply.hijack();
        proxyRequest(request.raw, reply.raw, session, targetPath);
        resolve();
      });
    }

    // Path-based launch (session.example.com): SPA broke out of /proxy/:slug/*
    const session = await loadRuntimeSession(
      (request.cookies as { gb_proxy?: string }).gb_proxy
    );
    if (!session) {
      return reply.code(404).send("Not found");
    }

    const allowed = await ensureAccessStillValid(session);
    if (!allowed) {
      return reply
        .code(403)
        .type("text/html")
        .send(
          "<h1>Access revoked</h1><p>Your access ended. Return to the dashboard.</p>"
        );
    }

    return new Promise<void>((resolve) => {
      reply.hijack();
      proxyRequest(request.raw, reply.raw, session, targetPath);
      resolve();
    });
  });

  setInterval(() => {
    cleanupExpiredTokens().catch((err) => fastify.log.error(err));
  }, 15 * 60 * 1000);

  // VPS: bind localhost only (nginx fronts it). Railway: must listen on 0.0.0.0.
  const bindHost =
    process.env.SESSION_SERVICE_BIND_HOST ||
    (process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "127.0.0.1");

  try {
    await fastify.listen({ port: PORT, host: bindHost });
    fastify.log.info(
      `Session service listening on ${bindHost}:${PORT} (public ${PUBLIC_URL})`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
