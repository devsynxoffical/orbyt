"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitUserToolRequest } from "@/lib/actions/admin";

type Tool = {
  id: string;
  name: string;
  description: string | null;
};

export function UserToolPicker({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customName, setCustomName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const toolIds = Array.from(selected);
    const noteParts = [note.trim()];
    if (customName.trim()) {
      noteParts.push(`Also requested (not in catalog): ${customName.trim()}`);
    }
    const fullNote = noteParts.filter(Boolean).join("\n");

    if (toolIds.length === 0 && !customName.trim()) {
      setError("Select at least one tool or enter a custom tool name");
      return;
    }

    setLoading(true);
    try {
      await submitUserToolRequest(toolIds, fullNote || undefined);
      setSuccess(true);
      setSelected(new Set());
      setCustomName("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-panel p-8 text-center">
        <p className="text-lg font-semibold text-collab-yellow">Request submitted</p>
        <p className="mt-2 text-sm text-neutral-600">
          An admin will review your tool selection and grant access.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {tools.length === 0 ? (
        <div className="dashboard-panel p-6 text-center text-sm text-neutral-600">
          No tools in the catalog yet. Ask your admin to add tools, or request a
          custom tool below.
        </div>
      ) : (
        <div className="dashboard-panel divide-y divide-neutral-100">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-collab-yellow">
              Select tools you need
            </h2>
            <p className="text-xs text-neutral-500">
              Check every tool you want access to
            </p>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {tools.map((tool) => (
              <li key={tool.id}>
                <label className="flex cursor-pointer items-start gap-3 px-5 py-3.5 hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={selected.has(tool.id)}
                    onChange={() => toggle(tool.id)}
                    className="mt-1 rounded border-neutral-300"
                  />
                  <div>
                    <p className="font-medium text-collab-yellow">{tool.name}</p>
                    {tool.description && (
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {tool.description}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-panel space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-collab-yellow">
            Request a tool not listed above
          </label>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Any tool name — we'll try to add it for you"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-collab-yellow">
            Note for admin (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Why you need these tools..."
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {loading ? "Submitting..." : "Submit tool request"}
      </button>
    </form>
  );
}
