export type ExtensionToolPreset = {
  slug: string;
  launchUrl: string;
  launchMode: "EXTENSION";
  cookieDomains: string[];
};

const PRESETS: Record<string, ExtensionToolPreset> = {
  canva: {
    slug: "canva",
    launchUrl: "https://www.canva.com/",
    launchMode: "EXTENSION",
    cookieDomains: ["canva.com"],
  },
  "chat-gpt": {
    slug: "chat-gpt",
    launchUrl: "https://chatgpt.com/",
    launchMode: "EXTENSION",
    cookieDomains: ["chatgpt.com", "openai.com"],
  },
  chatgpt: {
    slug: "chatgpt",
    launchUrl: "https://chatgpt.com/",
    launchMode: "EXTENSION",
    cookieDomains: ["chatgpt.com", "openai.com"],
  },
  claude: {
    slug: "claude",
    launchUrl: "https://claude.ai/new",
    launchMode: "EXTENSION",
    cookieDomains: ["claude.ai", "anthropic.com"],
  },
  "claude-ai": {
    slug: "claude-ai",
    launchUrl: "https://claude.ai/new",
    launchMode: "EXTENSION",
    cookieDomains: ["claude.ai", "anthropic.com"],
  },
  grammarly: {
    slug: "grammarly",
    launchUrl: "https://app.grammarly.com/",
    launchMode: "EXTENSION",
    cookieDomains: ["grammarly.com"],
  },
  quillbot: {
    slug: "quillbot",
    launchUrl: "https://quillbot.com/",
    launchMode: "EXTENSION",
    cookieDomains: ["quillbot.com"],
  },
  ahrefs: {
    slug: "ahrefs",
    launchUrl: "https://app.ahrefs.com/dashboard",
    launchMode: "EXTENSION",
    cookieDomains: ["ahrefs.com"],
  },
  semrush: {
    slug: "semrush",
    launchUrl: "https://www.semrush.com/projects/",
    launchMode: "EXTENSION",
    cookieDomains: ["semrush.com"],
  },
  moz: {
    slug: "moz",
    launchUrl: "https://moz.com/pro",
    launchMode: "EXTENSION",
    cookieDomains: ["moz.com"],
  },
  spyfu: {
    slug: "spyfu",
    launchUrl: "https://www.spyfu.com/overview",
    launchMode: "EXTENSION",
    cookieDomains: ["spyfu.com"],
  },
  majestic: {
    slug: "majestic",
    launchUrl: "https://majestic.com/reports/site-explorer",
    launchMode: "EXTENSION",
    cookieDomains: ["majestic.com"],
  },
};

const STRICT_EXTENSION_SLUGS = new Set([
  "canva",
  "chat-gpt",
  "chatgpt",
  "claude",
  "claude-ai",
  "grammarly",
  "quillbot",
]);

export function getExtensionToolPreset(
  slug?: string | null
): ExtensionToolPreset | null {
  if (!slug) return null;
  const key = slug.trim().toLowerCase();
  if (PRESETS[key]) return PRESETS[key];
  if (key.includes("chatgpt") || key.includes("chat-gpt")) {
    return PRESETS["chat-gpt"];
  }
  if (key.startsWith("claude")) {
    return PRESETS.claude;
  }
  if (key.startsWith("grammarly")) {
    return PRESETS.grammarly;
  }
  if (key.startsWith("canva")) {
    return PRESETS.canva;
  }
  if (key.startsWith("quillbot")) {
    return PRESETS.quillbot;
  }
  if (key.startsWith("ahrefs")) {
    return PRESETS.ahrefs;
  }
  if (key.startsWith("semrush")) {
    return PRESETS.semrush;
  }
  if (key.startsWith("moz")) {
    return PRESETS.moz;
  }
  if (key.startsWith("spyfu")) {
    return PRESETS.spyfu;
  }
  if (key.startsWith("majestic")) {
    return PRESETS.majestic;
  }
  return null;
}

export function isExtensionRequiredSlug(slug?: string | null): boolean {
  if (!slug) return false;
  const key = slug.trim().toLowerCase();
  return STRICT_EXTENSION_SLUGS.has(key);
}

/**
 * Normalizes a tool's launchUrl and launchMode when it matches a known tool preset.
 */
export function normalizeToolConfig<
  T extends {
    slug: string;
    launchUrl: string | null;
    launchMode?: "PROXY" | "EXTENSION" | "CLOUD" | "DIRECT" | null;
  },
>(tool: T): T & {
  launchUrl: string | null;
  launchMode: "PROXY" | "EXTENSION" | "CLOUD" | "DIRECT";
  needsDbHeal: boolean;
} {
  const preset = getExtensionToolPreset(tool.slug);
  const currentMode = tool.launchMode ?? "PROXY";

  if (!preset) {
    return {
      ...tool,
      launchMode: currentMode === "CLOUD" ? "EXTENSION" : currentMode,
      needsDbHeal: false,
    };
  }

  let normalizedUrl = tool.launchUrl?.trim() || null;

  // Upgrade bare/marketing URLs that don't land on the authenticated app
  if (!normalizedUrl) {
    normalizedUrl = preset.launchUrl;
  } else {
    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.toLowerCase();
      if (
        preset.slug === "grammarly" &&
        (host === "grammarly.com" || host === "www.grammarly.com") &&
        (parsed.pathname === "/" || parsed.pathname === "")
      ) {
        normalizedUrl = preset.launchUrl;
      } else if (
        (preset.slug === "chat-gpt" || preset.slug === "chatgpt") &&
        (host === "chat.openai.com" || host === "openai.com" || host === "www.openai.com")
      ) {
        normalizedUrl = preset.launchUrl;
      } else if (
        preset.slug === "ahrefs" &&
        (host === "ahrefs.com" || host === "www.ahrefs.com") &&
        (parsed.pathname === "/" || parsed.pathname === "")
      ) {
        normalizedUrl = preset.launchUrl;
      } else if (
        preset.slug === "semrush" &&
        (host === "semrush.com" || host === "www.semrush.com") &&
        (parsed.pathname === "/" || parsed.pathname === "")
      ) {
        normalizedUrl = preset.launchUrl;
      } else if (
        preset.slug === "moz" &&
        (host === "moz.com" || host === "www.moz.com") &&
        (parsed.pathname === "/" || parsed.pathname === "")
      ) {
        normalizedUrl = preset.launchUrl;
      }
    } catch {
      normalizedUrl = preset.launchUrl;
    }
  }

  // If tool is in STRICT_EXTENSION_SLUGS, force EXTENSION (unless DIRECT)
  // For other tools (ahrefs, semrush, etc.), honor admin's choice (PROXY, EXTENSION, or DIRECT)
  let normalizedMode: "PROXY" | "EXTENSION" | "DIRECT" = "PROXY";
  if (STRICT_EXTENSION_SLUGS.has(preset.slug)) {
    normalizedMode = currentMode === "DIRECT" ? "DIRECT" : "EXTENSION";
  } else {
    normalizedMode = currentMode === "CLOUD" ? "EXTENSION" : currentMode;
  }

  const needsDbHeal =
    tool.launchUrl !== normalizedUrl || currentMode !== normalizedMode;

  return {
    ...tool,
    launchUrl: normalizedUrl,
    launchMode: normalizedMode,
    needsDbHeal,
  };
}
