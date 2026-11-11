"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCustomToolByName, addCustomToolsBulk } from "@/lib/actions/admin";

export function QuickAddTools() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await addCustomToolByName(name);
      setName("");
      setMessage(`Added "${name.trim()}" to your catalog`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add tool");
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await addCustomToolsBulk(bulk);
      const parts: string[] = [];
      if (result.added.length)
        parts.push(`Added ${result.added.length}: ${result.added.join(", ")}`);
      if (result.skipped.length)
        parts.push(`Skipped (duplicate): ${result.skipped.join(", ")}`);
      setMessage(parts.join(" · ") || "Done");
      setBulk("");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add tools");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-panel p-5">
      <h2 className="text-sm font-semibold text-collab-yellow">
        Add any tool — your choice
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Type any SEO tool name. You are not limited to the suggestion library.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            mode === "single"
              ? "bg-primary-500 text-neutral-0"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Single tool
        </button>
        <button
          type="button"
          onClick={() => setMode("bulk")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            mode === "bulk"
              ? "bg-primary-500 text-neutral-0"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Multiple tools
        </button>
      </div>

      {mode === "single" ? (
        <form onSubmit={handleSingle} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ahrefs, Your Custom Tool, Any SEO App..."
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add tool"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleBulk} className="mt-4 space-y-3">
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={5}
            placeholder={"One tool per line, e.g.:\nAhrefs\nSemrush\nMy Private Tool\nAny tool you resell"}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            disabled={loading || !bulk.trim()}
            className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add all tools"}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-accent-600">
          {message}
        </p>
      )}
    </div>
  );
}
