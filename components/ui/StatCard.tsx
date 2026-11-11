import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "warning" | "neutral";
};

const accentStyles = {
  primary: "bg-primary-500/10 text-primary-600 ring-primary-500/20",
  accent: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
  warning: "bg-warning-500/10 text-warning-500 ring-warning-500/20",
  neutral: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${accentStyles[accent]}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="relative mt-3 text-3xl font-bold tracking-tight text-neutral-950">
        {value}
      </p>
      {hint && (
        <p className="relative mt-1.5 text-xs font-medium text-neutral-400">
          {hint}
        </p>
      )}
    </div>
  );
}
