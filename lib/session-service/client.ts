export function isSessionServiceConfigured(): boolean {
  return Boolean(
    process.env.SESSION_SERVICE_URL &&
      process.env.SESSION_SERVICE_API_KEY &&
      process.env.SESSION_ENCRYPTION_KEY
  );
}

export function getSessionServiceUrl(): string {
  return (process.env.SESSION_SERVICE_URL ?? "").replace(/\/$/, "");
}

export type LaunchResponse = {
  launchUrl: string;
  toolAccountId: string;
  expiresAt: string;
};

async function sessionFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const baseUrl = getSessionServiceUrl();
  const apiKey = process.env.SESSION_SERVICE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("Session service is not configured");
  }
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function requestToolLaunch(params: {
  userId: string;
  toolSlug: string;
  userEmail?: string;
}): Promise<LaunchResponse> {
  const res = await sessionFetch("/internal/launch", {
    method: "POST",
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to start tool session"
    );
  }

  return data as LaunchResponse;
}

export async function testToolAccountSession(accountId: string): Promise<{
  healthStatus: "ALIVE" | "EXPIRED" | "UNKNOWN";
  message: string;
}> {
  const res = await sessionFetch(`/internal/accounts/${accountId}/test`, {
    method: "POST",
    body: "{}",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.healthStatus) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Health check failed"
    );
  }
  return {
    healthStatus: data.healthStatus ?? "UNKNOWN",
    message: data.message ?? "Health check completed",
  };
}

export async function fetchAccountLoad(toolId: string): Promise<
  Array<{
    id: string;
    label: string;
    maxConcurrentUsers: number;
    active: boolean;
    healthStatus: string;
    activeNow: number;
  }>
> {
  const res = await sessionFetch(
    `/internal/accounts/load?toolId=${encodeURIComponent(toolId)}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to load capacity"
    );
  }
  return data.accounts ?? [];
}

export async function revokeProxySessions(params: {
  userId?: string;
  toolId?: string;
  toolAccountId?: string;
  sessionId?: string;
}): Promise<number> {
  if (!isSessionServiceConfigured()) return 0;
  try {
    const res = await sessionFetch("/internal/sessions/revoke", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return 0;
    return typeof data.revoked === "number" ? data.revoked : 0;
  } catch {
    return 0;
  }
}
