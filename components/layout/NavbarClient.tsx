"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { adminUrl } from "@/lib/config/site";

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/tools", label: "Workflows & Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type NavbarClientProps = {
  isLoggedIn: boolean;
  isAdmin?: boolean;
};

export function NavbarClient({ isLoggedIn, isAdmin = false }: NavbarClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/70 transition-all">
      <nav className="mx-auto flex h-[4.75rem] max-w-container items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Logo variant="light" size="lg" showText />
        </div>

        {/* Desktop Nav Center Pill */}
        <div className="hidden items-center gap-1 rounded-full bg-neutral-100/80 p-1.5 ring-1 ring-neutral-200/80 md:flex shadow-sm">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-150 ${
                  active
                    ? "bg-white text-neutral-950 shadow-sm font-bold"
                    : "text-neutral-600 hover:bg-white/80 hover:text-neutral-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 md:flex">
            {isLoggedIn ? (
              <Link
                href={isAdmin ? adminUrl("/admin") : "/dashboard"}
                className="btn-marketing-pill !rounded-full !px-5 !py-2 text-xs font-bold shadow-sm"
              >
                {isAdmin ? "Admin Console" : "Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:text-neutral-950"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-black active:scale-[0.98]"
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MaterialIcon name={open ? "close" : "menu"} className="text-xl" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="border-t border-neutral-200 bg-white px-5 py-4 shadow-xl md:hidden animate-in-fade">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-yellow-100/70 text-neutral-950"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4">
            {isLoggedIn ? (
              <Link
                href={isAdmin ? adminUrl("/admin") : "/dashboard"}
                className="btn-marketing text-center !rounded-full !py-2.5 text-sm"
                onClick={() => setOpen(false)}
              >
                {isAdmin ? "Admin Console" : "Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-marketing-outline text-center !rounded-full !py-2.5 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="btn-marketing text-center !rounded-full !py-2.5 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
