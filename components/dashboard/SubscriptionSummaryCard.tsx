import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToolLogo } from "@/components/ui/ToolLogo";

type SubscriptionSummaryCardProps = {
  planName: string;
  tools: { name: string; slug: string }[];
  startedAt?: Date | null;
  expiryDate?: Date | null;
  renewalDate?: Date | null;
  status: string;
  pricePkr?: number;
  priceCents?: number;
  notes?: string | null;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function daysRemaining(expiry: Date | null | undefined) {
  if (!expiry) return null;
  return Math.max(
    0,
    Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

export function SubscriptionSummaryCard({
  planName,
  tools,
  startedAt,
  expiryDate,
  renewalDate,
  status,
  pricePkr,
  notes,
}: SubscriptionSummaryCardProps) {
  const expires = expiryDate ?? renewalDate ?? null;
  const remaining = daysRemaining(expires);
  const pending = status === "PENDING";

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-collab-dark/10 bg-gradient-to-br from-collab-yellow/40 via-white to-white shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-collab-yellow/30 blur-2xl" />
      <div className="relative border-b border-collab-yellow/50 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-collab-dark">
              Current plan
            </p>
            <p className="mt-1.5 text-xl font-bold text-neutral-900">
              {planName}
              <span className="ml-2 text-base font-normal text-neutral-500">
                PKR {(pricePkr ?? 0).toLocaleString()}
              </span>
            </p>
          </div>
          <StatusBadge
            status={status}
            label={pending ? "Awaiting activation" : undefined}
          />
        </div>
      </div>
      <div className="relative grid gap-4 px-6 py-5 sm:grid-cols-3">
        <div className="rounded-xl bg-neutral-0/60 p-4 ring-1 ring-collab-yellow/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Start date
          </p>
          <p className="mt-1.5 text-sm font-semibold text-neutral-800">
            {formatDate(startedAt)}
          </p>
        </div>
        <div className="rounded-xl bg-neutral-0/60 p-4 ring-1 ring-collab-yellow/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Expiry date
          </p>
          <p className="mt-1.5 text-sm font-semibold text-neutral-800">
            {formatDate(expires)}
          </p>
        </div>
        <div className="rounded-xl bg-neutral-0/60 p-4 ring-1 ring-collab-yellow/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Days remaining
          </p>
          <p
            className={`mt-1.5 text-sm font-semibold ${
              remaining != null && remaining < 7
                ? "text-warning-500"
                : "text-neutral-800"
            }`}
          >
            {remaining != null ? `${remaining} days` : "—"}
          </p>
        </div>
      </div>
      {notes && (
        <div className="relative border-t border-collab-yellow/40 px-6 py-3">
          <p className="text-xs text-neutral-500">
            <span className="font-semibold">Admin note:</span> {notes}
          </p>
        </div>
      )}
      <div className="relative border-t border-collab-yellow/40 px-6 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Tools included ({tools.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {tools.length === 0 ? (
            <span className="text-sm text-neutral-500">
              {pending
                ? "Tools will appear after your admin activates the plan."
                : "No tools in this plan yet."}
            </span>
          ) : (
            tools.map((tool) => (
              <span
                key={tool.slug}
                className="inline-flex items-center rounded-full bg-white py-1 pl-1 pr-3 ring-1 ring-collab-dark/15"
              >
                <ToolLogo
                  name={tool.name}
                  slug={tool.slug}
                  size="xs"
                  showName
                  nameClassName="text-xs font-bold text-collab-dark"
                />
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
