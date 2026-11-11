import { ReactNode } from "react";

const accents = {
  blue: {
    bg: "bg-collab-yellow",
    icon: "text-neutral-950",
    ring: "ring-amber-300/60",
  },
  green: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    ring: "ring-emerald-200/60",
  },
  orange: {
    bg: "bg-orange-100",
    icon: "text-orange-600",
    ring: "ring-orange-200/60",
  },
  purple: {
    bg: "bg-violet-100",
    icon: "text-violet-600",
    ring: "ring-violet-200/60",
  },
  pink: {
    bg: "bg-pink-100",
    icon: "text-pink-600",
    ring: "ring-pink-200/60",
  },
  cyan: {
    bg: "bg-cyan-100",
    icon: "text-cyan-600",
    ring: "ring-cyan-200/60",
  },
} as const;

type ModernStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: keyof typeof accents;
  hint?: string;
};

export function ModernStatCard({
  label,
  value,
  icon,
  accent = "blue",
  hint,
}: ModernStatCardProps) {
  const style = accents[accent];

  return (
    <div className="modern-stat-card group">
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${style.bg} ${style.icon} ${style.ring} transition-transform duration-300 group-hover:scale-105`}
      >
        {icon}
      </div>
      <p className="text-center text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-center text-2xl font-extrabold tracking-tight text-collab-dark">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-center text-xs text-neutral-400">{hint}</p>
      )}
    </div>
  );
}
