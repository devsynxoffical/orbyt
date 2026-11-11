"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  homeHref: string;
  onMenuClick: () => void;
  userName?: string | null;
  userRole?: string | null;
  variant?: "user" | "admin";
};

export function DashboardHeader({
  title,
  subtitle,
  homeHref,
  onMenuClick,
  userName,
  userRole,
  variant = "user",
}: DashboardHeaderProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="dashboard-modern-header sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between gap-4 border-b border-collab-yellow/30 bg-collab-yellow/20 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-collab-dark/10 bg-white text-collab-dark lg:hidden"
            aria-label="Toggle menu"
          >
            <MaterialIcon name="menu" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold text-collab-dark sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-sm text-collab-dark/60 sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {userRole === "ADMIN" && (
            variant === "user" ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-lg bg-collab-yellow px-3 py-1.5 text-xs font-bold text-neutral-950 shadow-sm transition hover:brightness-105"
              >
                <MaterialIcon name="admin_panel_settings" className="text-sm" />
                Admin portal
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-collab-dark shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-50"
              >
                <MaterialIcon name="grid_view" className="text-sm" />
                User tools view
              </Link>
            )
          )}
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-collab-dark/70 transition hover:bg-white hover:text-collab-dark sm:inline-flex"
            title="Open marketing website in a new tab"
          >
            Website
            <MaterialIcon name="open_in_new" className="text-sm opacity-60" />
          </Link>
          <Link
            href={homeHref}
            className="hidden rounded-lg px-3 py-2 text-sm font-bold text-collab-dark/70 transition-colors hover:bg-collab-yellow/50 hover:text-collab-dark sm:inline-flex"
          >
            Dashboard
          </Link>
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-collab-dark text-xs font-bold text-collab-yellow sm:flex">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
