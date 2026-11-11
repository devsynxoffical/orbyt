"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  activateSubscription,
  cancelSubscription,
} from "@/lib/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Plan = {
  id: string;
  name: string;
  pricePkr: number;
  durationDays: number;
};

type Subscription = {
  id: string;
  status: string;
  startedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  plan: { id: string; name: string; pricePkr: number } | null;
};

type SubscriptionAssignPanelProps = {
  userId: string;
  subscriptions: Subscription[];
  plans: Plan[];
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplay(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function SubscriptionAssignPanel({
  userId,
  subscriptions,
  plans,
}: SubscriptionAssignPanelProps) {
  const router = useRouter();
  const latest = subscriptions[0] ?? null;
  const defaultPlan = plans[0];
  const defaultExpiry = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (defaultPlan?.durationDays ?? 30));
    return formatDateInput(d);
  }, [defaultPlan?.durationDays]);

  const [planId, setPlanId] = useState(defaultPlan?.id ?? "");
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === planId);

  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      const d = new Date();
      d.setDate(d.getDate() + plan.durationDays);
      setExpiresAt(formatDateInput(d));
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      await activateSubscription(userId, planId, expiresAt, notes);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await cancelSubscription(userId, subscriptionId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-collab-yellow">Subscription</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Assign a plan and activate access manually after offline payment.
        </p>
      </div>
      <div className="space-y-4 p-5">
        {latest ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-collab-yellow">
                  {latest.plan?.name ?? "No plan assigned"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {latest.plan
                    ? `PKR ${latest.plan.pricePkr.toLocaleString()}`
                    : "Awaiting plan assignment"}
                </p>
              </div>
              <StatusBadge
                status={latest.status}
                label={
                  latest.status === "PENDING"
                    ? "Awaiting activation"
                    : undefined
                }
              />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
              <p>Started: {formatDisplay(latest.startedAt)}</p>
              <p>Expires: {formatDisplay(latest.expiresAt)}</p>
            </div>
            {latest.notes && (
              <p className="mt-2 text-xs text-neutral-500">Note: {latest.notes}</p>
            )}
            {latest.status === "ACTIVE" && (
              <div className="mt-4">
                <ConfirmDialog
                  title="Cancel subscription?"
                  message="This revokes plan-based tool access for this user."
                  confirmLabel="Cancel subscription"
                  variant="danger"
                  onConfirm={() => handleCancel(latest.id)}
                  trigger={
                    <button
                      type="button"
                      className="text-sm font-semibold text-danger-500 hover:text-danger-600"
                      disabled={loading}
                    >
                      Cancel subscription
                    </button>
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No subscription record yet.</p>
        )}

        {(latest?.status === "PENDING" || !latest || latest.status !== "ACTIVE") && (
          <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 p-4">
            <p className="text-sm font-semibold text-collab-yellow">
              Activate subscription
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Plan
                </label>
                <select
                  className="input-field"
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — PKR {plan.pricePkr.toLocaleString()} /{" "}
                      {plan.durationDays} days
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Expiry date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  Admin notes (optional)
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Paid via bank transfer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {selectedPlan && (
                <p className="text-xs text-neutral-500">
                  Activating grants {selectedPlan.name} tools until{" "}
                  {formatDisplay(new Date(expiresAt))}.
                </p>
              )}
              {error && (
                <p className="text-sm text-danger-500">{error}</p>
              )}
              <button
                type="button"
                onClick={handleActivate}
                disabled={loading || !planId}
                className="btn-primary disabled:opacity-60"
              >
                {loading ? "Activating..." : "Activate subscription"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
