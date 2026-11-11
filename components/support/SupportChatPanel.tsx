"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSupportMessagesAction,
  markSupportThreadReadAction,
  sendSupportMessageAction,
} from "@/lib/actions/support";
import type { SupportMessageView } from "@/lib/data/support";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type SupportChatPanelProps = {
  threadId: string;
  mode: "user" | "admin";
  peerLabel?: string;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function SupportChatPanel({
  threadId,
  mode,
  peerLabel,
}: SupportChatPanelProps) {
  const [messages, setMessages] = useState<SupportMessageView[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchSupportMessagesAction(threadId);
      setMessages(next);
      await markSupportThreadReadAction(threadId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
    const id = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendSupportMessageAction(threadId, text);
      setDraft("");
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[min(70vh,560px)] flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-collab-yellow/30 px-4 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-collab-dark text-collab-yellow">
          <MaterialIcon name="support_agent" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-900">
            {mode === "user" ? "Orbyt Rush support" : peerLabel ?? "User"}
          </p>
          <p className="text-xs text-neutral-500">
            {mode === "user"
              ? "Messages go to the admin team. We usually reply within a few hours."
              : "Reply here — the user sees it on their dashboard."}
          </p>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-neutral-50/80 px-4 py-4"
      >
        {loading && messages.length === 0 && (
          <p className="text-center text-sm text-neutral-500">Loading…</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="rounded-lg bg-white px-4 py-6 text-center text-sm text-neutral-500">
            No messages yet. Say hello — ask about access, payments, or a tool
            not working.
          </p>
        )}
        {messages.map((m) => {
          const mine =
            (mode === "user" && m.senderRole === "USER") ||
            (mode === "admin" && m.senderRole === "ADMIN");
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-md bg-collab-dark text-white"
                    : "rounded-bl-md border border-neutral-100 bg-white text-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-neutral-300" : "text-neutral-400"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="border-t border-danger-100 bg-danger-50 px-4 py-2 text-xs text-danger-600">
          {error}
        </p>
      )}

      <div className="border-t border-neutral-100 bg-white p-3">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Type your message…"
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none ring-collab-yellow focus:border-collab-dark focus:ring-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            type="button"
            disabled={sending || !draft.trim()}
            onClick={() => void handleSend()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-collab-dark text-white transition hover:bg-neutral-800 disabled:opacity-50"
            aria-label="Send"
          >
            <MaterialIcon name="send" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-neutral-400">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
