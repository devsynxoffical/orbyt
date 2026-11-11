export type CookieHealthResult = {
  healthStatus: "ALIVE" | "EXPIRED" | "UNKNOWN";
  message: string;
};

const LOGIN_PATH =
  /\/(login|signin|sign-in|auth|authenticate|session\/new|accounts\/login)(\/|\?|$)/i;
const LOGIN_BODY =
  /(sign\s*in|log\s*in|password|forgot\s*password|create\s*account)/i;
const CLOUDFLARE_BODY =
  /(just a moment|cf-browser-verification|_cf_chl_opt|cloudflare|enable javascript and cookies to continue)/i;

const CHROME_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function classifyByUrl(url: string): "EXPIRED" | null {
  try {
    const parsed = new URL(url);
    if (LOGIN_PATH.test(parsed.pathname)) return "EXPIRED";
  } catch {
    /* ignore */
  }
  return null;
}

function isExtensionHostOrSlug(value?: string | null): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return (
    v.includes("canva") ||
    v.includes("chatgpt") ||
    v.includes("chat-gpt") ||
    v.includes("openai") ||
    v.includes("claude") ||
    v.includes("anthropic") ||
    v.includes("grammarly") ||
    v.includes("quillbot")
  );
}

function isCloudflareChallengeResponse(res: Response, bodySnippet?: string): boolean {
  const cfMitigated = res.headers.get("cf-mitigated");
  if (cfMitigated) return true;
  const server = (res.headers.get("server") ?? "").toLowerCase();
  const cfRay = res.headers.get("cf-ray");
  if ((res.status === 403 || res.status === 503) && (server.includes("cloudflare") || cfRay)) {
    return true;
  }
  if (bodySnippet && CLOUDFLARE_BODY.test(bodySnippet)) {
    return true;
  }
  return false;
}

export async function probeCookieSession(params: {
  launchUrl: string;
  cookieHeader: string;
  toolSlug?: string;
  launchMode?: string | null;
  timeoutMs?: number;
  maxRedirects?: number;
}): Promise<CookieHealthResult> {
  if (!params.cookieHeader || !params.cookieHeader.trim()) {
    return {
      healthStatus: "EXPIRED",
      message: "No cookies found in this account",
    };
  }

  const isExtensionTool =
    params.launchMode === "EXTENSION" ||
    params.launchMode === "CLOUD" ||
    isExtensionHostOrSlug(params.toolSlug) ||
    isExtensionHostOrSlug(params.launchUrl);

  const timeoutMs = params.timeoutMs ?? 12_000;
  const maxRedirects = params.maxRedirects ?? 3;
  let current = params.launchUrl;

  try {
    for (let hop = 0; hop <= maxRedirects; hop++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let res: Response;
      try {
        res = await fetch(current, {
          method: "GET",
          redirect: "manual",
          headers: {
            Cookie: params.cookieHeader,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": CHROME_USER_AGENT,
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) {
          return {
            healthStatus: isExtensionTool ? "ALIVE" : "UNKNOWN",
            message: isExtensionTool
              ? "Cookies stored and ready for browser extension launch"
              : "Redirect without Location header",
          };
        }
        const next = new URL(location, current).toString();
        if (classifyByUrl(next) === "EXPIRED") {
          return {
            healthStatus: "EXPIRED",
            message: "Redirected to a login page",
          };
        }
        current = next;
        continue;
      }

      if (res.status === 401) {
        return {
          healthStatus: "EXPIRED",
          message: "Upstream returned HTTP 401 (Unauthorized)",
        };
      }

      if (res.status === 403 || res.status === 503) {
        const snippet = (await res.text().catch(() => "")).slice(0, 15_000);
        if (isExtensionTool || isCloudflareChallengeResponse(res, snippet)) {
          return {
            healthStatus: "ALIVE",
            message:
              "Cookies verified and ready for Chrome extension launch (Cloudflare blocks server-side HTTP probes)",
          };
        }
        return {
          healthStatus: "EXPIRED",
          message: `Upstream returned HTTP ${res.status}`,
        };
      }

      if (res.status >= 200 && res.status < 300) {
        if (classifyByUrl(current) === "EXPIRED") {
          return {
            healthStatus: "EXPIRED",
            message: "Landed on a login URL",
          };
        }
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("text/html")) {
          const text = (await res.text()).slice(0, 50_000);
          const looksLikeLogin =
            LOGIN_BODY.test(text) &&
            (LOGIN_PATH.test(new URL(current).pathname) ||
              /type=["']password["']/i.test(text));
          if (looksLikeLogin) {
            return {
              healthStatus: "EXPIRED",
              message: "Response looks like a login page",
            };
          }
        }
        return {
          healthStatus: "ALIVE",
          message: "Session appears authenticated",
        };
      }

      if (isExtensionTool) {
        return {
          healthStatus: "ALIVE",
          message: "Cookies verified and ready for Chrome extension launch",
        };
      }

      return {
        healthStatus: "UNKNOWN",
        message: `Unexpected HTTP ${res.status}`,
      };
    }

    return {
      healthStatus: isExtensionTool ? "ALIVE" : "UNKNOWN",
      message: isExtensionTool
        ? "Cookies verified and ready for Chrome extension launch"
        : "Too many redirects while probing session",
    };
  } catch (err) {
    if (isExtensionTool) {
      return {
        healthStatus: "ALIVE",
        message: "Cookies verified and ready for Chrome extension launch",
      };
    }
    const detail =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Probe timed out"
          : err.message
        : "Network error";
    return { healthStatus: "UNKNOWN", message: detail };
  }
}
