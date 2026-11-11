"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { grantToolAccess, revokeToolAccess } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Tool = { id: string; name: string; slug: string };

type ToolAssignModalProps = {
  userId: string;
  allTools: Tool[];
  userToolIds: string[];
  accessMap: Record<string, string>;
};

export function ToolAssignModal({
  userId,
  allTools,
  userToolIds,
  accessMap,
}: ToolAssignModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleGrant = async (toolId: string) => {
    setLoading(toolId);
    try {
      await grantToolAccess(userId, toolId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleRevoke = async (toolId: string) => {
    setLoading(toolId);
    try {
      await revokeToolAccess(userId, toolId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
      >
        Manage tool access
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-0 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-collab-yellow">
              Tool access
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Grant or revoke manual access to individual tools.
            </p>

            <ul className="mt-6 space-y-3">
              {allTools.map((tool) => {
                const hasAccess = userToolIds.includes(tool.id);
                const status = accessMap[tool.id];
                const isActive = status === "ACTIVE";

                return (
                  <li
                    key={tool.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-collab-yellow">{tool.name}</p>
                      {hasAccess && status && (
                        <StatusBadge status={status} />
                      )}
                    </div>
                    {isActive ? (
                      <button
                        type="button"
                        disabled={loading === tool.id}
                        onClick={() => handleRevoke(tool.id)}
                        className="rounded-lg border border-danger-500/30 px-3 py-1.5 text-xs font-medium text-danger-500 hover:bg-danger-500/10 disabled:opacity-60"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading === tool.id}
                        onClick={() => handleGrant(tool.id)}
                        className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
                      >
                        Grant
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-collab-yellow hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
