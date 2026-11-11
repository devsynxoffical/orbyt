import Link from "next/link";
import { resolveToolLogoUrl } from "@/lib/tools/logos";
import { LaunchToolButton } from "@/components/dashboard/LaunchToolButton";

type ToolAvailabilityCardProps = {
  name: string;
  slug: string;
  iconUrl?: string | null;
  description?: string | null;
  available: boolean;
  expiresAt?: Date | null;
  launchMode?: "PROXY" | "EXTENSION" | "CLOUD" | "DIRECT";
};

function formatDate(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ToolAvailabilityCard({
  name,
  slug,
  iconUrl,
  description,
  available,
  expiresAt,
  launchMode,
}: ToolAvailabilityCardProps) {
  const logoUrl = resolveToolLogoUrl({ slug, name, iconUrl });

  return (
    <div className="dashboard-panel-modern overflow-hidden transition-all hover:shadow-card">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="h-10 w-10 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-extrabold text-collab-dark">
              {name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-collab-dark">{name}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                available
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200"
              }`}
            >
              {available ? "Available" : "Locked"}
            </span>
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
              {description}
            </p>
          )}
          {available && expiresAt && (
            <p className="mt-2 text-xs text-neutral-400">
              Until {formatDate(expiresAt)}
            </p>
          )}
          {available && launchMode === "PROXY" && (
            <p className="mt-1 text-[10px] font-medium text-emerald-700">
              Works on phone &amp; desktop
            </p>
          )}
          {available &&
            (launchMode === "EXTENSION" || launchMode === "CLOUD") && (
            <p className="mt-1 text-[10px] font-medium text-amber-700">
              Desktop Chrome + Orbyt Rush extension
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-collab-gray/50 px-5 py-4">
        {available ? (
          <LaunchToolButton slug={slug} launchMode={launchMode} />
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/buy/${slug}`}
              className="btn-primary flex-1 text-center !py-2.5 text-sm"
            >
              Buy this tool
            </Link>
            <Link
              href="/dashboard/subscription"
              className="btn-secondary flex-1 text-center !py-2.5 text-sm"
            >
              View plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
