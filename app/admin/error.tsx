"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-bold text-neutral-900">Admin unavailable</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sign in at{" "}
        <Link href="/admin/login" className="font-bold text-collab-dark">
          admin login
        </Link>
        . Use the same browser after clearing cookies if login
        loops.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-neutral-400">Reference: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-collab-dark px-4 py-2 text-sm font-bold text-white"
        >
          Try again
        </button>
        <Link
          href="/admin/login"
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700"
        >
          Admin login
        </Link>
      </div>
    </div>
  );
}
