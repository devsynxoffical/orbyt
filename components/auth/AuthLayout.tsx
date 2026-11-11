"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { Logo } from "@/components/layout/Logo";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

const highlights = [
  { icon: "apps", text: `${TOOL_CATALOG.length}+ SEO & outreach tools in one orbit` },
  { icon: "verified_user", text: "Secure 1-click Chrome launcher" },
  { icon: "bolt", text: "Instant activation with flexible passes" },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] lg:flex-row">
      {/* Mobile / tablet dark banner */}
      <div className="bg-[#181826] px-5 py-6 text-white lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <Logo showText variant="collab" href="/" />
          <Link
            href="/"
            className="shrink-0 text-xs font-bold text-neutral-400 hover:text-white"
          >
            &larr; Home
          </Link>
        </div>
        <h2 className="mx-auto mt-6 max-w-md text-2xl font-extrabold text-white">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-neutral-400">{subtitle}</p>
      </div>

      {/* Desktop left panel */}
      <div className="auth-panel-left relative hidden lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:p-12 bg-[#181826] text-white">
        <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative">
          <Logo showText variant="collab" href="/" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400 mb-6">
            <span>High-Velocity Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
            {title}
          </h2>
          <p className="mt-4 max-w-sm text-sm sm:text-base leading-relaxed text-neutral-400">
            {subtitle}
          </p>

          <div className="mt-10 space-y-4">
            {highlights.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-yellow-400 border border-white/10">
                  <MaterialIcon name={item.icon} className="text-lg" />
                </span>
                <span className="text-sm font-semibold text-neutral-300">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Orbyt Rush. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col bg-white">
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
