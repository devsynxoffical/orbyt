type StatusBadgeProps = {
  status: string;
  label?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
  SUSPENDED: "bg-danger-500/10 text-danger-500 ring-danger-500/20",
  LOCKED: "bg-warning-500/10 text-warning-600 ring-warning-500/20",
  PENDING: "bg-warning-500/10 text-warning-600 ring-warning-500/20",
  APPROVED: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
  REJECTED: "bg-danger-500/10 text-danger-500 ring-danger-500/20",
  CANCELED: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  EXPIRED: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  REVOKED: "bg-danger-500/10 text-danger-500 ring-danger-500/20",
  SUCCEEDED: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
  FAILED: "bg-danger-500/10 text-danger-500 ring-danger-500/20",
  REFUNDED: "bg-warning-500/10 text-warning-500 ring-warning-500/20",
  ALIVE: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
  UNKNOWN: "bg-warning-500/10 text-warning-600 ring-warning-500/20",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusStyles[status] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200";
  const display = label ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {display}
    </span>
  );
}
