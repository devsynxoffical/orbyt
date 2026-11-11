"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { AuthCard } from "@/components/auth/AuthCard";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function SignOutForm() {
  return (
    <AuthCard className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-collab-yellow text-neutral-950">
        <MaterialIcon name="logout" className="text-3xl" />
      </div>

      <h1 className="text-2xl font-extrabold text-collab-dark">Sign out</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Are you sure you want to sign out? You&apos;ll need to log in again to
        access your tools and dashboard.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard" className="btn-secondary w-full sm:min-w-[140px]">
          Stay signed in
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-primary w-full sm:min-w-[140px]"
        >
          Sign out
        </button>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-bold text-neutral-500 hover:text-collab-dark"
      >
        Back to homepage
      </Link>
    </AuthCard>
  );
}
