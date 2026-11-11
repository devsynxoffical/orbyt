import { StatusBadge } from "@/components/ui/StatusBadge";
import { LaunchToolButton } from "@/components/dashboard/LaunchToolButton";
import { resolveToolLogoUrl } from "@/lib/tools/logos";

const toolThemes: Record<string, { gradient: string; text: string; ring: string }> = {
  ahrefs: { gradient: "from-orange-500/25 to-orange-600/5", text: "text-orange-800", ring: "ring-orange-200/50" },
  semrush: { gradient: "from-red-500/25 to-red-600/5", text: "text-red-800", ring: "ring-red-200/50" },
  moz: { gradient: "from-blue-500/25 to-blue-600/5", text: "text-blue-800", ring: "ring-blue-200/50" },
  spyfu: { gradient: "from-amber-500/25 to-amber-600/5", text: "text-amber-800", ring: "ring-amber-200/50" },
  majestic: { gradient: "from-purple-500/25 to-purple-600/5", text: "text-purple-800", ring: "ring-purple-200/50" },
  ubersuggest: { gradient: "from-teal-500/25 to-teal-600/5", text: "text-teal-800", ring: "ring-teal-200/50" },
};

type ToolCardProps = {
  name: string;
  slug?: string;
  iconUrl?: string | null;
  description: string | null;
  status: string;
  expiresAt?: Date | null;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ToolCard({
  name,
  slug,
  iconUrl,
  description,
  status,
  expiresAt,
}: ToolCardProps) {
  const logoUrl = resolveToolLogoUrl({ slug, name, iconUrl });
  const theme =
    toolThemes[slug ?? ""] ??
    ({ gradient: "from-primary-500/20 to-primary-600/5", text: "text-primary-800", ring: "ring-primary-200/50" } as const);

  return (
    <div className="tool-card group">
      <div className={`bg-gradient-to-br px-5 py-5 ${theme.gradient}`}>
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-neutral-0/90 text-sm font-bold text-neutral-800 shadow-sm ring-1 backdrop-blur-sm ${theme.ring} transition-transform duration-500 group-hover:scale-110`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-9 w-9 object-contain"
                loading="lazy"
              />
            ) : (
              name.charAt(0)
            )}
          </div>
          <StatusBadge status={status} />
        </div>
        <h3 className={`mt-4 text-lg font-bold ${theme.text}`}>{name}</h3>
      </div>
      <div className="p-5 pt-4">
        {description && (
          <p className="text-sm leading-relaxed text-neutral-600 line-clamp-2">
            {description}
          </p>
        )}
        {expiresAt && status === "ACTIVE" && (
          <p className="mt-3 text-xs font-medium text-neutral-400">
            Access until {formatDate(expiresAt)}
          </p>
        )}
        {status === "ACTIVE" && slug ? (
          <LaunchToolButton slug={slug} />
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm font-medium text-neutral-400"
          >
            Launch unavailable
          </button>
        )}
      </div>
    </div>
  );
}
