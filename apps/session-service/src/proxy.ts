import type { ServerResponse, IncomingMessage } from "http";
import httpProxy from "http-proxy";
import {
  isAllowedRedirectHost,
  rewriteLocationToProxy,
} from "./url-allowlist.js";

export type ProxySession = {
  id: string;
  userId: string;
  toolId: string;
  toolAccountId: string;
  toolSlug: string;
  upstream: string;
  cookieHeader: string;
  allowedHosts: string[];
  expiresAt: number;
  lastAccessCheckAt: number;
};

const sessions = new Map<string, ProxySession>();

export function cacheProxySession(session: ProxySession) {
  sessions.set(session.id, session);
  return session;
}

export function getCachedProxySession(id: string | undefined): ProxySession | null {
  if (!id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(id);
    return null;
  }
  return session;
}

export function dropCachedProxySession(id: string) {
  sessions.delete(id);
}

export function dropCachedSessionsMatching(predicate: (s: ProxySession) => boolean) {
  for (const [id, session] of sessions.entries()) {
    if (predicate(session)) sessions.delete(id);
  }
}

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  secure: true,
  xfwd: true,
});

proxy.on("proxyRes", (proxyRes, req) => {
  const headers = proxyRes.headers;
  delete headers["set-cookie"];
  delete headers["content-security-policy"];
  delete headers["x-frame-options"];

  const session = (req as IncomingMessage & { __gbSession?: ProxySession })
    .__gbSession;
  const location = headers.location;
  if (session && typeof location === "string") {
    if (
      !isAllowedRedirectHost(location, session.upstream, session.allowedHosts)
    ) {
      delete headers.location;
    } else {
      const rewritten = rewriteLocationToProxy(
        location,
        session.upstream,
        `/proxy/${session.toolSlug}`
      );
      if (rewritten) {
        headers.location = rewritten;
      } else {
        // Cross-host but allowlisted: leave absolute Location as-is
        // (browser will leave proxy — preferred over rewriting foreign hosts).
      }
    }
  }
});

export function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
  session: ProxySession,
  targetPath: string
) {
  const upstream = new URL(session.upstream);
  // Prefer the browser query string; strip any Fastify-matched path noise.
  const rawUrl = req.url ?? "";
  const queryIndex = rawUrl.indexOf("?");
  const query = queryIndex >= 0 ? rawUrl.slice(queryIndex) : "";
  const normalizedPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

  // Block logout and account termination requests to protect shared proxy sessions
  const lowerPath = normalizedPath.toLowerCase();
  if (
    lowerPath === "/logout" ||
    lowerPath.startsWith("/logout/") ||
    lowerPath === "/signout" ||
    lowerPath.startsWith("/signout/") ||
    lowerPath.includes("/auth/logout") ||
    lowerPath.includes("/user/logout") ||
    lowerPath.includes("/api/auth/signout")
  ) {
    res.writeHead(302, { Location: `/proxy/${session.toolSlug}/` });
    res.end();
    return;
  }

  const target = `${upstream.origin}${normalizedPath}${query}`;

  (req as IncomingMessage & { __gbSession?: ProxySession }).__gbSession =
    session;

  req.headers.cookie = session.cookieHeader;
  req.headers.host = upstream.host;
  delete req.headers["accept-encoding"];
  delete req.headers.authorization;

  proxy.web(req, res, { target, changeOrigin: true, ignorePath: true }, (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(`Proxy error: ${err?.message ?? "unknown"}`);
    }
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) sessions.delete(id);
  }
}, 5 * 60 * 1000);
