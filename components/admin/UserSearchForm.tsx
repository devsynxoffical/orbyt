"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserSearchFormProps = {
  defaultSearch: string;
  defaultStatus: string;
};

export function UserSearchForm({
  defaultSearch,
  defaultStatus,
}: UserSearchFormProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState(defaultStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          Search
        </label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email..."
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="LOCKED">Locked (failed logins)</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
      >
        Filter
      </button>
    </form>
  );
}
