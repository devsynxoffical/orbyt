"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-extrabold text-collab-dark">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-neutral-600">
        The page failed to load. This is often a temporary database connection
        issue — try again in a moment.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-neutral-400">Digest: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-collab-yellow px-5 py-2.5 text-sm font-bold text-neutral-950 shadow-sm hover:brightness-105"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-bold text-collab-dark"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
