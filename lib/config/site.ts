function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.split(":")[0].toLowerCase();
}

export function getAdminHost(): string | null {
  const host = process.env.ADMIN_HOST?.trim();
  return host ? host.toLowerCase() : null;
}

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAdminBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL.replace(/\/$/, "");
  }
  const adminHost = getAdminHost();
  if (!adminHost) return getAppBaseUrl();
  const proto =
    process.env.NEXT_PUBLIC_APP_PROTOCOL ??
    (getAppBaseUrl().startsWith("https") ? "https" : "http");
  return `${proto}://${adminHost}`;
}

export function adminUrl(path = "/admin"): string {
  const base = getAdminBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function adminLoginUrl(): string {
  return adminUrl("/admin/login");
}

export function isAdminHost(hostHeader: string | null | undefined): boolean {
  const adminHost = getAdminHost();
  if (!adminHost) return false;
  return normalizeHost(hostHeader) === adminHost;
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
}

export function isStripeConfigured(): boolean {
  return Boolean(
    isStripeEnabled() && process.env.STRIPE_SECRET_KEY?.trim()
  );
}
