const CLAIM_FALLBACK = "https://rankmora.io/api/tools/extension/claim";

// Prevent tabs from navigating to settings, account, or logout endpoints to protect shared accounts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url || (tab && tab.url) || "";
  if (targetUrl) {
    try {
      const url = new URL(targetUrl);
      const path = url.pathname.toLowerCase();
      const href = targetUrl.toLowerCase();
      if (
        path.includes("/settings") ||
        path.includes("/account") ||
        path.includes("/your-account") ||
        path.includes("/login-and-security") ||
        path.includes("/billing") ||
        path.includes("/invoices") ||
        path.includes("/subscription") ||
        path.includes("/logout") ||
        path.includes("/signout") ||
        path.includes("/auth/logout") ||
        path.includes("/api/auth/signout") ||
        href.includes("chatgpt.com/#settings")
      ) {
        chrome.tabs.update(tabId, { url: `${url.origin}/` });
      }
    } catch {}
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "LAUNCH") return false;

  handleLaunch(message)
    .then((result) => sendResponse(result))
    .catch((err) =>
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : "Launch failed",
      })
    );

  return true;
});

async function handleLaunch(message) {
  const claimUrl = message.claimUrl || CLAIM_FALLBACK;
  const version = message.version || chrome.runtime.getManifest().version;
  const res = await fetch(claimUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: message.claimToken, version }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      typeof data.error === "string" ? data.error : "Could not claim launch"
    );
    if (data.code) {
      err.code = data.code;
    }
    throw err;
  }

  const cookies = Array.isArray(data.cookies) ? data.cookies : [];
  const openUrl = pickOpenUrl(data.openUrl || message.openUrl, cookies);
  if (!openUrl) {
    throw new Error("Invalid launch payload");
  }
  if (cookies.length === 0) {
    throw new Error("No session cookies returned. Admin must re-export cookies.");
  }

  await clearMatchingCookies(openUrl, cookies);

  let cookiesSet = 0;
  const failedNames = [];
  for (const cookie of cookies) {
    if (await setCookie(openUrl, cookie)) {
      cookiesSet += 1;
    } else {
      failedNames.push(cookie.name);
    }
  }

  if (cookiesSet === 0) {
    throw new Error(
      "Chrome rejected all session cookies. Reload or update the Orbyt Rush extension in chrome://extensions, disable other cookie blockers, and try again."
    );
  }

  await chrome.tabs.create({ url: openUrl, active: true });

  const warn =
    failedNames.length > 0
      ? ` (${failedNames.length} non-essential/expired cookie(s) skipped: ${failedNames.slice(0, 3).join(", ")})`
      : "";

  return {
    ok: true,
    cookiesSet,
    cookiesTotal: cookies.length,
    openUrl,
    warning: warn || undefined,
  };
}

function pickOpenUrl(openUrl, cookies) {
  let open = null;
  if (openUrl) {
    try {
      open = new URL(openUrl);
    } catch {
      open = null;
    }
  }

  if (open) {
    const host = open.hostname.toLowerCase();
    // Ensure Ahrefs lands on authenticated dashboard
    if (
      (host === "ahrefs.com" || host === "www.ahrefs.com") &&
      (open.pathname === "/" || open.pathname === "")
    ) {
      return "https://app.ahrefs.com/dashboard";
    }
    // Ensure Semrush lands on projects
    if (
      (host === "semrush.com" || host === "www.semrush.com") &&
      (open.pathname === "/" || open.pathname === "")
    ) {
      return "https://www.semrush.com/projects/";
    }
    // Ensure Moz lands on Moz Pro
    if (
      (host === "moz.com" || host === "www.moz.com") &&
      (open.pathname === "/" || open.pathname === "")
    ) {
      return "https://moz.com/pro";
    }
    // Ensure Grammarly opens the authenticated app dashboard instead of marketing page
    if (
      (host === "grammarly.com" || host === "www.grammarly.com") &&
      (open.pathname === "/" || open.pathname === "")
    ) {
      return "https://app.grammarly.com/";
    }
    // Ensure legacy OpenAI chat URLs open chatgpt.com
    if (
      host === "chat.openai.com" ||
      host === "openai.com" ||
      host === "www.openai.com"
    ) {
      return "https://chatgpt.com/";
    }
    return open.href;
  }

  const counts = new Map();
  for (const c of cookies) {
    if (typeof c.domain === "string" && c.domain.trim()) {
      const host = c.domain.trim().replace(/^\./, "");
      counts.set(host, (counts.get(host) || 0) + 1);
    }
  }
  if (counts.size === 0) return null;

  const [bestHost] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return `https://${bestHost}/`;
}

function registrableDomain(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
}

function mapSameSite(raw, secure) {
  const v = (raw || "").toLowerCase();
  if (v === "no_restriction" || v === "none") return "no_restriction";
  if (v === "strict") return "strict";
  if (v === "lax") return "lax";
  if (v === "unspecified" || !v) {
    return secure ? "no_restriction" : "lax";
  }
  return secure ? "no_restriction" : "lax";
}

function buildSetAttempts(cookie, openUrl, sameSiteOverride) {
  const open = new URL(openUrl);
  const path =
    cookie.path && String(cookie.path).startsWith("/") ? cookie.path : "/";
  let secure = cookie.secure !== false;
  const httpOnly = Boolean(cookie.httpOnly);
  let sameSite = sameSiteOverride ?? mapSameSite(cookie.sameSite, secure);
  if (sameSite === "no_restriction") {
    secure = true;
  }

  const expirationDate =
    typeof cookie.expirationDate === "number" && cookie.expirationDate > 0
      ? cookie.expirationDate
      : undefined;

  const common = {
    name: cookie.name,
    value: cookie.value,
    path,
    secure,
    httpOnly,
    sameSite,
    ...(expirationDate ? { expirationDate } : {}),
  };

  const attempts = [];
  const seen = new Set();
  const push = (details) => {
    const key = `${details.url}|${details.domain || ""}|${details.name}|${details.path}|${details.sameSite || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    attempts.push(details);
  };

  const rawDomain =
    typeof cookie.domain === "string" ? cookie.domain.trim() : "";
  const cleanHost = rawDomain.replace(/^\./, "");

  // __Host- cookies MUST be secure, have path "/", and have NO domain attribute.
  if (cookie.name.startsWith("__Host-")) {
    if (cleanHost) {
      push({
        ...common,
        url: `https://${cleanHost}/`,
        path: "/",
        secure: true,
      });
    }
    push({
      ...common,
      url: `${open.origin}/`,
      path: "/",
      secure: true,
    });
    return attempts;
  }

  if (cookie.name.startsWith("__Secure-")) {
    secure = true;
    common.secure = true;
  }

  if (rawDomain) {
    if (rawDomain.startsWith(".")) {
      const apex = rawDomain.slice(1);
      push({ ...common, url: `https://${apex}${path}`, domain: rawDomain });
      push({ ...common, url: `https://www.${apex}${path}`, domain: rawDomain });
      push({ ...common, url: `https://${apex}/`, domain: rawDomain });
    } else {
      // Host-only cookie (e.g. ChatGPT __Secure-next-auth.session-token on chatgpt.com)
      push({ ...common, url: `https://${rawDomain}${path}` });
      push({ ...common, url: `https://${rawDomain}/` });
      // Fallback as domain cookie
      push({
        ...common,
        url: `https://${rawDomain}${path}`,
        domain: `.${rawDomain}`,
      });
      const parent = registrableDomain(rawDomain);
      if (parent !== rawDomain) {
        push({
          ...common,
          url: `https://${rawDomain}${path}`,
          domain: `.${parent}`,
        });
      }
    }
  }

  const rd = registrableDomain(open.hostname);
  push({ ...common, url: `${open.origin}${path}` });
  push({ ...common, url: `${open.origin}/` });
  push({ ...common, url: `https://${rd}${path}`, domain: `.${rd}` });
  push({ ...common, url: `https://www.${rd}${path}`, domain: `.${rd}` });

  return attempts;
}

async function setCookie(openUrl, cookie) {
  const adjustedCookie = ensureValidExpiration(cookie);

  const secure = adjustedCookie.secure !== false;
  const sameSiteTry = [
    mapSameSite(adjustedCookie.sameSite, secure),
    "lax",
    "no_restriction",
    "strict",
    "unspecified",
  ];
  const tried = new Set();

  for (const sameSite of sameSiteTry) {
    if (tried.has(sameSite)) continue;
    tried.add(sameSite);

    const attempts = buildSetAttempts(
      { ...adjustedCookie, sameSite },
      openUrl,
      sameSite
    );
    for (const details of attempts) {
      try {
        const result = await chrome.cookies.set(details);
        if (result) return true;
      } catch {
        // Ignore and try next candidate
      }
    }
  }
  return false;
}

/**
 * If an exported cookie had a short expirationDate in the past, extend it
 * slightly so Chrome doesn't immediately discard it before the server checks the session.
 */
function ensureValidExpiration(cookie) {
  if (typeof cookie.expirationDate !== "number" || cookie.expirationDate <= 0) {
    return cookie;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (cookie.expirationDate <= nowSec) {
    return {
      ...cookie,
      expirationDate: nowSec + 7 * 24 * 3600,
    };
  }
  return cookie;
}

async function clearMatchingCookies(openUrl, cookies) {
  const domains = new Set();
  const urls = new Set();
  try {
    const open = new URL(openUrl);
    urls.add(`${open.origin}/`);
    domains.add(registrableDomain(open.hostname));
  } catch {
    return;
  }

  for (const c of cookies) {
    if (typeof c.domain === "string" && c.domain.trim()) {
      const host = c.domain.trim().replace(/^\./, "");
      urls.add(`https://${host}/`);
      domains.add(registrableDomain(host));
    }
  }

  const toRemove = [];
  for (const domain of domains) {
    try {
      const found = await chrome.cookies.getAll({ domain });
      toRemove.push(...found);
    } catch {
      // Ignore if domain query unsupported
    }
  }
  for (const url of urls) {
    try {
      const found = await chrome.cookies.getAll({ url });
      toRemove.push(...found);
    } catch {
      // Ignore
    }
  }

  const removedKeys = new Set();
  for (const e of toRemove) {
    const host = (e.domain || "").replace(/^\./, "");
    if (!host) continue;
    const path = e.path && e.path.startsWith("/") ? e.path : "/";
    const protocol = e.secure === false ? "http" : "https";
    const removeUrl = `${protocol}://${host}${path}`;
    const key = `${removeUrl}|${e.name}|${e.storeId || ""}`;
    if (removedKeys.has(key)) continue;
    removedKeys.add(key);

    try {
      await chrome.cookies.remove({
        url: removeUrl,
        name: e.name,
        ...(e.storeId ? { storeId: e.storeId } : {}),
      });
    } catch {
      // Ignore individual removal errors
    }
  }
}
