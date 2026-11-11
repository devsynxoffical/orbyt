/**
 * Orbyt Rush Tool Launcher - Account & Personal Information Shield Engine
 * Deeply masks emails, usernames, avatars, billing details, and phone numbers
 * across all shared tools (ChatGPT, Claude, Canva, Grammarly, QuillBot, Semrush, etc.)
 * while completely locking settings, profile editing, and logout.
 */
(() => {
  // Prevent duplicate execution within the same page context
  if (window.__ORBYTRUSH_SHIELD_INITIALIZED__) return;
  window.__ORBYTRUSH_SHIELD_INITIALIZED__ = true;

  function isRestrictedUrl(urlStr) {
    const s = String(urlStr || "").toLowerCase();
    return (
      s.includes("/settings") ||
      s.includes("/account") ||
      s.includes("/your-account") ||
      s.includes("/login-and-security") ||
      s.includes("/billing") ||
      s.includes("/invoices") ||
      s.includes("/subscription") ||
      s.includes("/logout") ||
      s.includes("/signout") ||
      s.includes("chatgpt.com/#settings") ||
      s.includes("/api/auth/signout") ||
      s.includes("/api/auth/logout")
    );
  }

  // 0. Immediate URL Gatekeeper:
  // If the current page is a settings/account page, wipe HTML immediately and bounce to tool root.
  function enforceUrlProtection() {
    if (isRestrictedUrl(window.location.pathname) || isRestrictedUrl(window.location.href)) {
      try {
        window.stop();
      } catch {}
      try {
        if (document.documentElement) {
          document.documentElement.innerHTML = `
            <div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#0f172a;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
              <div style="text-align:center;padding:24px;">
                <div style="margin-bottom:12px;display:flex;justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z"/></svg></div>
                <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;">Settings Protected</h2>
                <p style="margin:0;color:#94a3b8;font-size:14px;">Personal settings are secured by Orbyt Rush. Redirecting to workspace...</p>
              </div>
            </div>
          `;
        }
      } catch {}
      try {
        window.location.replace(`${window.location.origin}/`);
      } catch {}
      return true;
    }
    return false;
  }

  if (enforceUrlProtection()) return;

  // Continuous 250ms guard for SPAs that change URLs dynamically
  setInterval(enforceUrlProtection, 250);

  // 1. Monkey-Patch HTML5 History API to prevent client-side SPA navigation into settings
  const _origPush = history.pushState;
  history.pushState = function (...args) {
    const target = args[2] ? String(args[2]) : "";
    if (target && isRestrictedUrl(target)) {
      showShieldToast("Settings Locked", "Account settings are locked by Orbyt Rush to protect shared access.");
      return;
    }
    const res = _origPush.apply(this, args);
    enforceUrlProtection();
    return res;
  };

  const _origReplace = history.replaceState;
  history.replaceState = function (...args) {
    const target = args[2] ? String(args[2]) : "";
    if (target && isRestrictedUrl(target)) {
      showShieldToast("Settings Locked", "Account settings are locked by Orbyt Rush to protect shared access.");
      return;
    }
    const res = _origReplace.apply(this, args);
    enforceUrlProtection();
    return res;
  };

  const SENSITIVE_CLICK_PATTERNS = [
    /\b(log\s*out|sign\s*out|logout|signout)\b/i,
    /\b(change\s*password|reset\s*password|update\s*password)\b/i,
    /\b(delete\s*account|close\s*account)\b/i,
    /\b(log\s*out\s*of\s*all\s*devices|sign\s*out\s*all\s*sessions)\b/i,
    /\b(export\s*data|billing\s*settings|payment\s*methods)\b/i,
    /\b(account\s*settings|your\s*account|account\s*and\s*security|your\s*profile)\b/i,
    /\b(disconnect)\b/i,
    /\b(settings)\b/i,
  ];

  const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  const USER_RE = /\b(syehassanali|hassan\s+ali|syed\s+hassan\s*ali|syed\s+hassan|rank\s+mora)\b/gi;
  const CARD_RE = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b(?:ending in \d{4}|••••\s*\d{4})\b/gi;
  const PHONE_RE = /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g;

  function sanitizeString(str) {
    if (!str || typeof str !== "string") return str;
    return str
      .replace(EMAIL_RE, "Orbyt Rush Member")
      .replace(USER_RE, "Orbyt Rush Member")
      .replace(CARD_RE, "[Protected Card]")
      .replace(PHONE_RE, (m) => (m.includes("http") ? m : "[Protected Phone]"));
  }

  const GENERIC_SHIELD_SVG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'/></svg>";

  /**
   * 2. Toast Notification
   */
  let toastTimer = null;
  function showShieldToast(title, message) {
    let toast = document.getElementById("orbytrush-shield-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "orbytrush-shield-toast";
      toast.innerHTML = `
        <div class="orbytrush-toast-icon" style="display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z"/></svg></div>
        <div class="orbytrush-toast-body">
          <strong id="orbytrush-toast-title"></strong>
          <p id="orbytrush-toast-msg"></p>
        </div>
      `;
      (document.body || document.documentElement).appendChild(toast);
    }

    const titleEl = toast.querySelector("#orbytrush-toast-title");
    const msgEl = toast.querySelector("#orbytrush-toast-msg");
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    toast.classList.remove("orbytrush-fade-out");
    toast.style.display = "flex";

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add("orbytrush-fade-out");
      setTimeout(() => {
        toast.style.display = "none";
      }, 250);
    }, 3200);
  }

  /**
   * 3. Global Capture-Phase Click Interceptor
   */
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!target || !(target instanceof Element)) return;

      const interactive = target.closest("button, a, [role='menuitem'], [role='button'], li");
      const el = interactive || target;

      const text = (el.textContent || "").trim();
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";
      const ariaLabel = el.getAttribute("aria-label") || "";
      const combined = `${text} ${href} ${ariaLabel}`.toLowerCase();

      // Check for logout triggers
      if (
        combined.includes("logout") ||
        combined.includes("log out") ||
        combined.includes("sign out") ||
        combined.includes("signout") ||
        href.includes("/api/auth/signout") ||
        href.includes("/auth/logout")
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        showShieldToast(
          "Logout Disabled",
          "Logging out is restricted to protect your active Orbyt Rush shared tool access."
        );
        return false;
      }

      // Check for settings, profile, or account security triggers
      if (
        combined.includes("account settings") ||
        combined.includes("your account") ||
        combined.includes("your profile") ||
        combined.includes("login-and-security") ||
        combined.includes("security") ||
        combined.includes("billing") ||
        combined.includes("subscription") ||
        combined.includes("change password") ||
        combined.includes("reset password") ||
        combined.includes("delete account") ||
        combined.includes("disconnect") ||
        href.includes("/settings") ||
        href.includes("/account") ||
        (combined.includes("settings") && !combined.includes("model"))
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        showShieldToast(
          "Settings Locked",
          "Account settings and personal profile details are protected by Orbyt Rush."
        );
        return false;
      }
    },
    true
  );

  /**
   * 4. Deep TreeWalker for Personal Information Sanitization
   */
  function sanitizeTextNodes(root) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const parent = currentNode.parentElement;
      if (parent) {
        const tagName = parent.tagName.toLowerCase();
        if (tagName !== "script" && tagName !== "style") {
          const text = currentNode.nodeValue;
          if (text && text.trim()) {
            const sanitized = sanitizeString(text);
            if (sanitized !== text) {
              currentNode.nodeValue = sanitized;
            }
          }
        }
      }
      currentNode = walker.nextNode();
    }
  }

  /**
   * 5. Sanitize Input Elements
   */
  function sanitizeInputs(root) {
    if (!root || !root.querySelectorAll) return;

    const inputs = root.querySelectorAll(
      'input[type="email"], input[name*="email"], input[autocomplete="email"], input[value*="@"]'
    );
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement && !input.getAttribute("data-orbytrush-masked")) {
        input.setAttribute("data-orbytrush-masked", "true");
        input.value = "protected@orbytrush.io";
        input.setAttribute("disabled", "true");
        input.style.setProperty("filter", "blur(4px)", "important");
      }
    });
  }

  /**
   * 6. Sanitize Avatars
   */
  function sanitizeAvatars(root) {
    if (!root || !root.querySelectorAll) return;

    const avatars = root.querySelectorAll(
      'img[src*="googleusercontent.com"], img[src*="gravatar.com"], img[src*="auth0.com"], img[alt*="avatar" i], img[alt*="profile" i]'
    );
    avatars.forEach((img) => {
      if (img instanceof HTMLImageElement && !img.getAttribute("data-orbytrush-avatar")) {
        img.setAttribute("data-orbytrush-avatar", "true");
        img.src = GENERIC_SHIELD_SVG;
      }
    });
  }

  /**
   * 7. Element Hider & Action Sanitizer
   */
  function hideElement(el) {
    if (!el || el.getAttribute("data-orbytrush-hidden") === "true") return;
    el.setAttribute("data-orbytrush-hidden", "true");
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
  }

  function sanitizeElement(el) {
    if (!el || !(el instanceof Element)) return;

    // Check links with settings or logout URLs
    if (el instanceof HTMLAnchorElement) {
      const href = (el.getAttribute("href") || "").toLowerCase();
      if (
        href.includes("/settings") ||
        href.includes("/account") ||
        href.includes("/your-account") ||
        href.includes("/billing") ||
        href.includes("/logout") ||
        href.includes("/signout")
      ) {
        hideElement(el);
        return;
      }
    }

    // Check buttons & menu items
    const role = el.getAttribute("role");
    const tagName = el.tagName.toLowerCase();
    const isClickable =
      tagName === "button" ||
      tagName === "a" ||
      role === "menuitem" ||
      role === "button" ||
      el.hasAttribute("data-testid");

    if (isClickable) {
      const rawText = (el.textContent || "").trim();
      for (const pattern of SENSITIVE_CLICK_PATTERNS) {
        if (pattern.test(rawText)) {
          hideElement(el);
          return;
        }
      }
    }

    // Hide modals containing settings
    if (role === "dialog") {
      const text = (el.textContent || "").toLowerCase();
      if (text.includes("settings") || text.includes("data controls") || text.includes("security")) {
        hideElement(el);
        showShieldToast("Settings Protected", "Settings are locked to protect shared tool access.");
      }
    }

    // Hide Disconnect / Edit / Photo buttons
    const btnText = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    const aria = (el.getAttribute("aria-label") || "").toLowerCase();
    if (
      btnText === "disconnect" ||
      btnText.includes("disconnect") ||
      btnText === "change photo" ||
      btnText === "remove photo" ||
      aria.includes("disconnect") ||
      aria.includes("change photo") ||
      aria.includes("remove photo") ||
      (btnText === "edit" && !window.location.pathname.includes("/design/"))
    ) {
      if (tagName === "button" || role === "button" || tagName === "a") {
        hideElement(el);
      }
    }

    // Tool specific sanitizers
    const host = window.location.hostname;
    if (host.includes("chatgpt.com") || host.includes("openai.com")) {
      maskChatGPTProfile(el);
    } else if (host.includes("claude.ai") || host.includes("anthropic.com")) {
      maskClaudeProfile(el);
    } else if (host.includes("canva.com")) {
      maskCanvaProfile(el);
    } else if (host.includes("grammarly.com")) {
      maskGrammarlyProfile(el);
    }
  }

  /**
   * ChatGPT Specific Deep Masking
   */
  function maskChatGPTProfile(root) {
    const profileBtns = root.querySelectorAll
      ? root.querySelectorAll(
          'nav button, [data-testid="profile-button"], button:has(img[alt*="User"])'
        )
      : [];

    profileBtns.forEach((btn) => {
      const avatarBox = btn.querySelector('[class*="avatar"], div:has(> img)');
      if (avatarBox && !avatarBox.getAttribute("data-orbytrush-shield-icon")) {
        avatarBox.setAttribute("data-orbytrush-shield-icon", "true");
        avatarBox.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z"/></svg>`;
      }

      const textContainers = btn.querySelectorAll("div, span, p");
      textContainers.forEach((tc) => {
        if (tc.children.length === 0 && tc.textContent) {
          const txt = tc.textContent.trim();
          if (
            txt.length > 1 &&
            !txt.includes("ChatGPT") &&
            !txt.includes("New chat") &&
            !txt.includes("Orbyt Rush")
          ) {
            const sanitized = sanitizeString(txt);
            if (sanitized !== txt || txt.toLowerCase() !== "free") {
              if (!tc.getAttribute("data-orbytrush-masked")) {
                tc.setAttribute("data-orbytrush-masked", "true");
                tc.textContent = "Orbyt Rush Member";
              }
            } else if (txt.toLowerCase() === "free") {
              tc.textContent = "Pro Access";
            }
          }
        }
      });
    });

    const settingsBtns = root.querySelectorAll
      ? root.querySelectorAll('nav a[href*="settings"], nav button:has(svg.lucide-settings)')
      : [];
    settingsBtns.forEach((sb) => hideElement(sb));
  }

  /**
   * Claude Specific Deep Masking
   */
  function maskClaudeProfile(root) {
    const profileLabels = root.querySelectorAll
      ? root.querySelectorAll('[data-testid="user-menu"], nav button, [data-testid="account-menu"]')
      : [];

    profileLabels.forEach((label) => {
      sanitizeTextNodes(label);
      const avatar = label.querySelector('[class*="avatar"], div[class*="rounded-full"]');
      if (avatar && !avatar.getAttribute("data-orbytrush-avatar-set")) {
        avatar.setAttribute("data-orbytrush-avatar-set", "true");
        avatar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z"/></svg>`;
      }
    });
  }

  /**
   * Canva Specific Deep Masking
   */
  function maskCanvaProfile(root) {
    const userContainers = root.querySelectorAll
      ? root.querySelectorAll(
          'header [aria-label*="account" i], header button:has(img), a[href*="/settings"], button[aria-label*="Settings" i], button[aria-label*="Disconnect" i]'
        )
      : [];

    userContainers.forEach((uc) => {
      const href = uc instanceof HTMLAnchorElement ? uc.getAttribute("href") || "" : "";
      const aria = (uc.getAttribute("aria-label") || "").toLowerCase();
      if (href.includes("/settings") || aria.includes("settings") || aria.includes("disconnect")) {
        hideElement(uc);
      } else {
        sanitizeTextNodes(uc);
      }
    });

    // Replace initials inside avatar circles (e.g. "rm", "RM", "HA")
    const avatars = root.querySelectorAll ? root.querySelectorAll("span, div") : [];
    avatars.forEach((node) => {
      if (
        node.childNodes &&
        node.childNodes.length === 1 &&
        node.childNodes[0].nodeType === Node.TEXT_NODE
      ) {
        const val = (node.textContent || "").trim();
        if (val.length <= 2 && /^(rm|ha|sh|sa)$/i.test(val)) {
          node.textContent = "R";
        }
      }
    });
  }

  /**
   * Grammarly Specific Deep Masking
   */
  function maskGrammarlyProfile(root) {
    const userContainers = root.querySelectorAll
      ? root.querySelectorAll('nav [data-qa*="user"], nav [data-name*="user"], [class*="user-menu"]')
      : [];

    userContainers.forEach((uc) => {
      sanitizeTextNodes(uc);
    });
  }

  /**
   * 8. MutationObserver
   */
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          sanitizeElement(node);
          sanitizeTextNodes(node);
          sanitizeInputs(node);
          sanitizeAvatars(node);

          const descendants = node.querySelectorAll
            ? node.querySelectorAll("a, button, [role='menuitem'], [role='tab'], [role='dialog'], div, span, input")
            : [];
          descendants.forEach((d) => {
            sanitizeElement(d);
          });
        }
      }
    }
  });

  function startObserver() {
    const rootTarget = document.body || document.documentElement;
    if (rootTarget) {
      observer.observe(rootTarget, { childList: true, subtree: true });
      sanitizeElement(rootTarget);
      sanitizeTextNodes(rootTarget);
      sanitizeInputs(rootTarget);
      sanitizeAvatars(rootTarget);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        const target = document.body || document.documentElement;
        if (target) {
          observer.observe(target, { childList: true, subtree: true });
          sanitizeElement(target);
          sanitizeTextNodes(target);
          sanitizeInputs(target);
          sanitizeAvatars(target);
        }
      });
    }
  }

  startObserver();
  window.addEventListener("popstate", enforceUrlProtection);

  /**
   * 9. Add non-intrusive Session Badge
   */
  function injectSessionBadge() {
    if (document.getElementById("orbytrush-session-badge")) return;
    const badge = document.createElement("div");
    badge.id = "orbytrush-session-badge";
    badge.innerHTML = `<span class="orbytrush-dot"></span> Protected Session`;
    (document.body || document.documentElement).appendChild(badge);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSessionBadge);
  } else {
    injectSessionBadge();
  }
})();
