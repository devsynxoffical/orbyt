"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantToolsByEmail } from "@/lib/actions/admin";
import { resolveToolLogoUrl } from "@/lib/tools/logos";

type Tool = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
};

type GrantAccessFormProps = {
  tools: Tool[];
  initialEmail?: string;
  initialGrantedIds?: string[];
};

export function GrantAccessForm({
  tools,
  initialEmail = "",
  initialGrantedIds = [],
}: GrantAccessFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(initialEmail);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialGrantedIds)
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggleTool(toolId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await grantToolsByEmail(email, Array.from(selected));
        setSuccess(
          `Access saved for ${result.userName} — ${selected.size} tool${selected.size === 1 ? "" : "s"} granted.`
        );
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save access");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="user-email"
          className="mb-1.5 block text-sm font-semibold text-neutral-800"
        >
          User email
        </label>
        <input
          id="user-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="input-field"
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          Enter the email the user signed up with, then select tools to grant.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-800">
          Select tools to grant
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const checked = selected.has(tool.id);
            const logoUrl = resolveToolLogoUrl({ slug: tool.slug, name: tool.name, iconUrl: tool.iconUrl });

            return (
              <label
                key={tool.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  checked
                    ? "border-collab-dark/30 bg-collab-yellow/50"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTool(tool.id)}
                  className="h-4 w-4 rounded border-neutral-300 text-collab-dark focus:ring-collab-yellow"
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className="h-7 w-7 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-collab-dark">
                      {tool.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-neutral-800">
                  {tool.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-danger-500/20 bg-danger-500/5 px-4 py-3 text-sm text-danger-500">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3 text-sm text-accent-600">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full sm:w-auto disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save & grant access"}
      </button>
    </form>
  );
}
