"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  deleteToolAccount,
  getToolAccountCapacity,
  saveToolAccount,
  testToolAccount,
  toggleToolAccountActive,
} from "@/lib/actions/tool-accounts";
import type { ToolAccountView } from "@/lib/data/tool-accounts";
import { StatusBadge } from "@/components/ui/StatusBadge";

const schema = z.object({
  label: z.string().min(1, "Label is required"),
  cookieJson: z.string(),
  maxConcurrentUsers: z.number().min(1).max(100),
  active: z.boolean(),
  notes: z.string(),
});

type FormData = z.infer<typeof schema>;

type ToolAccountsPanelProps = {
  toolId: string;
  toolName: string;
  launchUrl: string | null;
  accounts: ToolAccountView[];
};

const COOKIE_EXAMPLE = `[
  { "name": "session_id", "value": "your-session-value", "domain": ".example.com", "path": "/" }
]`;

function healthLabel(status: string) {
  if (status === "ALIVE") return "Alive";
  if (status === "EXPIRED") return "Expired";
  return "Unknown";
}

export function ToolAccountsPanel({
  toolId,
  toolName,
  launchUrl,
  accounts,
}: ToolAccountsPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<ToolAccountView | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    getToolAccountCapacity(toolId)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const row of rows) map[row.id] = row.activeNow;
        setCapacity(map);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [toolId, accounts]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      cookieJson: "",
      maxConcurrentUsers: 5,
      active: true,
      notes: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      label: `${toolName} Account ${accounts.length + 1}`,
      cookieJson: "",
      maxConcurrentUsers: 5,
      active: true,
      notes: "",
    });
    setShowForm(true);
  };

  const openEdit = (account: ToolAccountView) => {
    setEditing(account);
    reset({
      label: account.label,
      cookieJson: "",
      maxConcurrentUsers: account.maxConcurrentUsers,
      active: account.active,
      notes: account.notes ?? "",
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setMessage(null);
    if (!editing && !data.cookieJson.trim()) {
      setError("Paste exported browser cookies when creating a new account");
      return;
    }
    try {
      await saveToolAccount({
        id: editing?.id,
        toolId,
        label: data.label,
        cookieJson: data.cookieJson,
        maxConcurrentUsers: data.maxConcurrentUsers,
        active: data.active,
        notes: data.notes,
      });
      setShowForm(false);
      setEditing(null);
      setMessage(
        editing
          ? "Account updated. Run Test session after replacing cookies."
          : "Account added. Click Test session to verify it is Alive."
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save account");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Remove account "${label}"?`)) return;
    try {
      await deleteToolAccount(id, toolId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleToolAccountActive(id, toolId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleTest = async (id: string) => {
    setError(null);
    setMessage(null);
    setTestingId(id);
    try {
      const result = await testToolAccount(id, toolId);
      setMessage(`Test result: ${result.healthStatus} — ${result.message}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {!launchUrl && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set a <strong>Launch URL</strong> on this tool first (e.g. https://www.semrush.com).
          Edit the tool under Admin → Tools.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Tool accounts</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Store login cookies for {toolName}. Users launch through the session proxy — credentials are never shared.
            Refresh cookies when status shows Expired.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600"
        >
          + Add account
        </button>
      </div>

      {message && (
        <p className="rounded-lg bg-accent-500/10 px-4 py-3 text-sm text-accent-600">{message}</p>
      )}
      {error && (
        <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{error}</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="dashboard-panel space-y-4 p-6">
          <h4 className="font-semibold text-neutral-900">
            {editing ? `Edit ${editing.label}` : "New tool account"}
          </h4>
          <div>
            <label className="mb-1 block text-sm font-medium">Account label</label>
            <input
              {...register("label")}
              placeholder="Semrush Account 1"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-danger-500">{errors.label.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Cookies JSON {editing ? "(leave blank to keep existing)" : ""}
            </label>
            <textarea
              {...register("cookieJson")}
              rows={8}
              placeholder={COOKIE_EXAMPLE}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-xs"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Export from Cookie-Editor / EditThisCookie while logged into the tool. Stored encrypted. Do not paste passwords.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Max concurrent users</label>
              <input
                type="number"
                min={1}
                max={100}
                {...register("maxConcurrentUsers", { valueAsNumber: true })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("active")} className="rounded" />
                Active
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
            <textarea
              {...register("notes")}
              rows={2}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="dashboard-panel p-6 text-sm text-neutral-500">
          No accounts yet. Log into the tool in your browser, export cookies, and paste them here.
        </div>
      ) : (
        <div className="dashboard-panel divide-y divide-neutral-50">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-neutral-900">{account.label}</p>
                  <StatusBadge
                    status={account.active ? "ACTIVE" : "SUSPENDED"}
                    label={account.active ? "Active" : "Disabled"}
                  />
                  <StatusBadge
                    status={account.healthStatus}
                    label={healthLabel(account.healthStatus)}
                  />
                </div>
                <p className="text-sm text-neutral-500">
                  Capacity {capacity[account.id] ?? 0}/{account.maxConcurrentUsers} ·{" "}
                  {account.cookieCount ?? 0} cookies
                  {account.lastHealthCheckAt &&
                    ` · Checked ${new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(account.lastHealthCheckAt)}`}
                </p>
                {account.healthStatus === "EXPIRED" && (
                  <p className="mt-1 text-xs text-danger-500">
                    Session expired — export fresh cookies and Test again. Account was not auto-disabled.
                  </p>
                )}
                {account.lastHealthError && account.healthStatus !== "ALIVE" && (
                  <p className="mt-1 text-xs text-neutral-400">{account.lastHealthError}</p>
                )}
                {account.notes && (
                  <p className="mt-1 text-xs text-neutral-400">{account.notes}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={testingId === account.id || !launchUrl}
                  onClick={() => handleTest(account.id)}
                  className="text-sm font-medium text-accent-600 hover:text-accent-700 disabled:opacity-50"
                >
                  {testingId === account.id ? "Testing..." : "Test session"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(account.id)}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {account.active ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(account)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(account.id, account.label)}
                  className="text-sm font-medium text-danger-500 hover:text-danger-500/80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
