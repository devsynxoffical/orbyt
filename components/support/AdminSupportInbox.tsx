"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SupportThreadSummary } from "@/lib/data/support";
import { setSupportThreadStatusAction } from "@/lib/actions/support";
import { SupportChatPanel } from "@/components/support/SupportChatPanel";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type AdminSupportInboxProps = {
  threads: SupportThreadSummary[];
  activeThreadId: string | null;
};

function formatRelative(date: Date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

export function AdminSupportInbox({
  threads,
  activeThreadId,
}: AdminSupportInboxProps) {
  const router = useRouter();
  const active = threads.find((t) => t.id === activeThreadId) ?? null;

  const toggleStatus = async (threadId: string, close: boolean) => {
    await setSupportThreadStatusAction(threadId, close ? "CLOSED" : "OPEN");
    router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
      <div className="dashboard-panel-modern overflow-hidden">
        <div className="border-b border-neutral-100 px-4 py-3">
          <h2 className="text-sm font-bold text-neutral-900">Inbox</h2>
          <p className="text-xs text-neutral-500">
            {threads.filter((t) => t.adminUnreadCount > 0).length} unread
          </p>
        </div>
        <ul className="max-h-[min(70vh,560px)] divide-y divide-neutral-50 overflow-y-auto">
          {threads.map((t) => {
            const selected = t.id === activeThreadId;
            return (
              <li key={t.id}>
                <Link
                  href={`/admin/support?thread=${t.id}`}
                  className={`block px-4 py-3 transition-colors ${
                    selected ? "bg-collab-yellow/40" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-neutral-900">
                        {t.user.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {t.user.email}
                      </p>
                    </div>
                    {t.adminUnreadCount > 0 && (
                      <span className="shrink-0 rounded-full bg-collab-dark px-2 py-0.5 text-[10px] font-bold text-white">
                        {t.adminUnreadCount}
                      </span>
                    )}
                  </div>
                  {t.preview && (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                      {t.preview}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {formatRelative(t.lastMessageAt)}
                    {t.status === "CLOSED" ? " · Closed" : ""}
                  </p>
                </Link>
              </li>
            );
          })}
          {threads.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-neutral-500">
              No conversations yet. Users can message you from Support on their
              dashboard.
            </li>
          )}
        </ul>
      </div>

      <div>
        {active ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {active.user.name}
                </p>
                <Link
                  href={`/admin/users/${active.userId}`}
                  className="text-xs font-medium text-collab-dark hover:underline"
                >
                  View user profile →
                </Link>
              </div>
              <button
                type="button"
                onClick={() =>
                  void toggleStatus(active.id, active.status === "OPEN")
                }
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                <MaterialIcon name={active.status === "OPEN" ? "lock" : "lock_open"} className="text-base" />
                {active.status === "OPEN" ? "Close chat" : "Reopen chat"}
              </button>
            </div>
            <SupportChatPanel
              threadId={active.id}
              mode="admin"
              peerLabel={active.user.name}
            />
          </>
        ) : (
          <div className="flex h-[min(70vh,560px)] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center">
            <MaterialIcon name="forum" className="mb-2 text-4xl text-neutral-300" />
            <p className="text-sm font-bold text-neutral-700">
              Select a conversation
            </p>
            <p className="mt-1 max-w-sm text-xs text-neutral-500">
              Choose a user on the left to read and reply. New chats appear when
              users open Support on their dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
