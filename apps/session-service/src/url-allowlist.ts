import { isIP } from "net";
import { lookup } from "dns/promises";

const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|172\.(1[6-9]|2\d|3[01])\.)/;

function isPrivateOrLocalIp(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateOrLocalIp(normalized.slice(7));
  }
  return PRIVATE_IPV4.test(normalized);
}

export function hostsFromLaunchUrl(launchUrl: string): string[] {
  const url = new URL(launchUrl);
  const host = url.hostname.toLowerCase();
  const hosts = new Set<string>([host]);
  if (host.startsWith("www.")) {
    hosts.add(host.slice(4));
  } else if (host.includes(".")) {
    hosts.add(`www.${host}`);
  }
  return Array.from(hosts);
}

export function assertSafeUpstreamUrl(
  raw: string,
  options: { allowHttpLocalhost?: boolean; allowedHosts?: string[] } = {}
): { url: URL; hosts: string[] } {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Launch URL must be a valid absolute URL");
  }

  const isLocalHttp =
    options.allowHttpLocalhost &&
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");

  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("Launch URL must use HTTPS");
  }

  if (url.username || url.password) {
    throw new Error("Launch URL must not include credentials");
  }

  const host = url.hostname.toLowerCase();
  if (!host || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Launch URL hostname is not allowed");
  }

  if (isIP(host) && isPrivateOrLocalIp(host) && !isLocalHttp) {
    throw new Error("Launch URL must not target private or link-local IPs");
  }

  const derived = hostsFromLaunchUrl(url.toString());
  if (options.allowedHosts && options.allowedHosts.length > 0) {
    const allow = new Set(options.allowedHosts.map((h) => h.toLowerCase()));
    if (!allow.has(host)) {
      throw new Error(`Host ${host} is not in the tool allowlist`);
    }
  }

  return { url, hosts: derived };
}

export async function assertResolvablePublicHost(hostname: string): Promise<void> {
  if (hostname === "localhost" || hostname === "127.0.0.1") return;
  if (isIP(hostname)) {
    if (isPrivateOrLocalIp(hostname)) {
      throw new Error("Resolved address is private or link-local");
    }
    return;
  }

  const results = await lookup(hostname, { all: true });
  if (!results.length) {
    throw new Error(`Could not resolve hostname ${hostname}`);
  }
  for (const entry of results) {
    if (isPrivateOrLocalIp(entry.address)) {
      throw new Error(`Hostname ${hostname} resolves to a private address`);
    }
  }
}

export function isAllowedRedirectHost(
  location: string,
  upstreamOrigin: string,
  allowedHosts: string[]
): boolean {
  try {
    const base = new URL(upstreamOrigin);
    const target = new URL(location, base);
    if (target.protocol !== "https:" && target.protocol !== "http:") return false;
    const host = target.hostname.toLowerCase();
    const allow = new Set(allowedHosts.map((h) => h.toLowerCase()));
    allow.add(base.hostname.toLowerCase());
    return allow.has(host);
  } catch {
    return false;
  }
}

export function rewriteLocationToProxy(
  location: string,
  upstreamOrigin: string,
  proxyPrefix: string
): string | null {
  try {
    const base = new URL(upstreamOrigin);
    const target = new URL(location, base);
    if (target.origin !== base.origin) return null;
    const path = `${target.pathname}${target.search}${target.hash}`;
    const prefix = proxyPrefix.replace(/\/$/, "");
    return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
  } catch {
    return null;
  }
}
