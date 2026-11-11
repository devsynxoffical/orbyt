const LOGO_BY_SLUG: Record<string, string> = {
  ahrefs: "/tool-logos/ahrefs.png",
  semrush: "/tool-logos/semrush.png",
  moz: "/tool-logos/moz.png",
  "moz-pro": "/tool-logos/moz.png",
  majestic: "/tool-logos/majestic.png",
  spyfu: "/tool-logos/spyfu.png",
  "keywords-everywhere": "/tool-logos/keywords-everywhere.png",
  kwfinder: "/tool-logos/kwfinder.png",
  "lynda-com": "/tool-logos/lynda-com.png",
  picmonkey: "/tool-logos/picmonkey.png",
  placeit: "/tool-logos/placeit.png",
  quetext: "/tool-logos/quetext.png",
  quillbot: "/tool-logos/quillbot.png",
  rytr: "/tool-logos/rytr.png",
  scribd: "/tool-logos/scribd.png",
  slideshare: "/tool-logos/slideshare.png",
  spamzilla: "/tool-logos/spamzilla.png",
  "spin-rewriter": "/tool-logos/spin-rewriter.png",
  "tuts-plus": "/tool-logos/tuts-plus.png",
  woorank: "/tool-logos/woorank.png",
  wordai: "/tool-logos/wordai.png",
  wordhero: "/tool-logos/wordhero.png",
  wordtracker: "/tool-logos/wordtracker.png",
  wordtune: "/tool-logos/wordtune.png",
  writehuman: "/tool-logos/writehuman.png",
  writerzen: "/tool-logos/writerzen.png",
  // New premium tools with authentic original logos
  canva: "/tool-logos/canva.svg",
  claude: "/tool-logos/claude.svg",
  grammarly: "/tool-logos/grammarly.svg",
  chatgpt: "/tool-logos/chatgpt.svg",
  "chat-gpt": "/tool-logos/chatgpt.svg",
  "openai-chatgpt": "/tool-logos/chatgpt.svg",
};

/** Only paths we ship under public/tool-logos (avoid DB iconUrl 404s). */
const KNOWN_LOGO_PATHS = new Set(Object.values(LOGO_BY_SLUG));

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getToolLogoUrl({
  slug,
  name,
}: {
  slug?: string | null;
  name: string;
}): string | null {
  if (slug) {
    const s = slug.toLowerCase().trim();
    if (LOGO_BY_SLUG[s]) return LOGO_BY_SLUG[s];
  }

  const nameSlug = slugify(name);
  if (LOGO_BY_SLUG[nameSlug]) return LOGO_BY_SLUG[nameSlug];

  // Fuzzy match on stripped alphanumeric key
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, path] of Object.entries(LOGO_BY_SLUG)) {
    if (key.replace(/[^a-z0-9]/g, "") === cleaned) {
      return path;
    }
  }

  return null;
}

/** Prefer shipped logos; ignore broken DB iconUrl values like /tool-logos/missing.png */
export function resolveToolLogoUrl({
  slug,
  name,
  iconUrl,
}: {
  slug?: string | null;
  name: string;
  iconUrl?: string | null;
}): string | null {
  const mapped = getToolLogoUrl({ slug, name });
  if (mapped) return mapped;
  if (iconUrl && (KNOWN_LOGO_PATHS.has(iconUrl) || iconUrl.startsWith("/tool-logos/"))) {
    return iconUrl;
  }
  return null;
}
