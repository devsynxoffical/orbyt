"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const legalLinks = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border-2 border-neutral-200/80 bg-white p-3 shadow-sm">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
        Legal documents
      </p>
      <ul className="space-y-1">
        {legalLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? "bg-collab-dark text-white"
                    : "text-neutral-600 hover:bg-collab-yellow/50 hover:text-collab-dark"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
