"use client";

import Link from "next/link";

type SignOutLinkProps = {
  className?: string;
  children?: React.ReactNode;
};

export function SignOutLink({
  className = "rounded-xl border border-neutral-200/80 bg-neutral-0/80 px-3.5 py-1.5 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-card",
  children = "Sign out",
}: SignOutLinkProps) {
  return (
    <Link href="/signout" className={className}>
      {children}
    </Link>
  );
}
