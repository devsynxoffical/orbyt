"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  dismissToolRequest,
  fulfillToolRequest,
} from "@/lib/actions/tool-requests";
import type { ToolRequestView } from "@/lib/data/tool-requests";

type PendingToolRequestsProps = {
  requests: ToolRequestView[];
};

export function PendingToolRequestsClient({ requests }: PendingToolRequestsProps) {
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  function handleDismiss(id: string) {
    startTransition(async () => {
      await dismissToolRequest(id);
    });
  }

  function handleFulfill(id: string) {
    startTransition(async () => {
      await fulfillToolRequest(id);
    });
  }

  return (
    <div className="dashboard-panel mb-6 overflow-hidden">
      <div className="border-b border-warning-500/20 bg-warning-500/5 px-5 py-4">
        <h2 className="text-sm font-semibold text-neutral-900">
          User tool requests ({requests.length})
        </h2>
        <p className="text-xs text-neutral-600">
          Users selected tools they want — grant access from the user detail page
        </p>
      </div>
      <ul className="divide-y divide-neutral-100">
        {requests.map((req) => (
          <li
            key={req.id}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {req.userName}{" "}
                <span className="font-normal text-neutral-500">
                  ({req.userEmail})
                </span>
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Wants:{" "}
                {req.tools.length > 0
                  ? req.tools.map((t) => t.name).join(", ")
                  : "—"}
              </p>
              {req.note && (
                <p className="mt-1 text-xs text-neutral-500">{req.note}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/admin/users/${req.userId}`}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
              >
                Review & assign
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleFulfill(req.id)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Mark done
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDismiss(req.id)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
