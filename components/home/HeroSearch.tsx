"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : "/tools");
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full items-center gap-2 rounded-full border border-neutral-300/80 bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
        <MaterialIcon name="search" className="shrink-0 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Semrush, Ahrefs, Moz, Canva..."
          className="w-full min-w-0 border-0 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-black sm:px-6"
      >
        Search tools
      </button>
    </form>
  );
}
