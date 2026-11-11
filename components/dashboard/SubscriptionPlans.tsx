"use client";

import { useState } from "react";
import { isStripeEnabled } from "@/lib/config/site";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { ToolLogo } from "@/components/ui/ToolLogo";

type PlanTool = { tool: { id: string; name: string; slug: string } };

export type SubscriptionPlanView = {
  id: string;
  name: string;
  description: string | null;
  pricePkr: number;
  durationDays: number;
  tools: PlanTool[];
};

type SubscriptionPlansProps = {
  plans: SubscriptionPlanView[];
  currentPlanId?: string | null;
  hasActiveSubscription?: boolean;
};

export function SubscriptionPlans({
  plans,
  currentPlanId,
  hasActiveSubscription = false,
}: SubscriptionPlansProps) {
  if (plans.length === 0) {
    return (
      <div className="dashboard-panel-modern px-6 py-12 text-center text-sm text-neutral-500">
        No subscription plans are available yet. Check back soon or buy individual
        tools from the pricing page.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={plan.id === currentPlanId}
          hasActiveSubscription={hasActiveSubscription}
        />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  hasActiveSubscription,
}: {
  plan: SubscriptionPlanView;
  isCurrent: boolean;
  hasActiveSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripeEnabled = isStripeEnabled();

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error("Stripe did not return a checkout URL");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm ${
        isCurrent
          ? "border-collab-yellow ring-2 ring-collab-yellow/30"
          : "border-neutral-200/80"
      }`}
    >
      {isCurrent && (
        <span className="mb-3 inline-flex w-fit rounded-full bg-collab-yellow px-3 py-1 text-xs font-bold text-neutral-950">
          Your current plan
        </span>
      )}
      <h3 className="text-xl font-extrabold text-collab-dark">{plan.name}</h3>
      {plan.description && (
        <p className="mt-2 text-sm text-neutral-600">{plan.description}</p>
      )}
      <p className="mt-4 text-3xl font-extrabold text-collab-dark">
        PKR {plan.pricePkr.toLocaleString()}
      </p>
      <p className="text-sm text-neutral-500">{plan.durationDays} days access</p>

      <ul className="mt-5 flex-1 space-y-2">
        <li className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <MaterialIcon name="check_circle" className="text-lg text-emerald-500" filled />
          {plan.tools.length} tools included
        </li>
        <li className="flex items-center gap-2 text-sm text-neutral-600">
          <MaterialIcon name="bolt" className="text-lg text-collab-yellow" />
          Instant access after payment
        </li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {plan.tools.slice(0, 6).map(({ tool }) => (
          <ToolLogo
            key={tool.id}
            name={tool.name}
            slug={tool.slug}
            size="xs"
            showName={false}
          />
        ))}
        {plan.tools.length > 6 && (
          <span className="flex h-5 items-center rounded-lg bg-neutral-100 px-2 text-[10px] font-bold text-neutral-500">
            +{plan.tools.length - 6}
          </span>
        )}
      </div>

      <div className="mt-6">
        {isCurrent ? (
          <div className="space-y-2">
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
              Active on your account
            </p>
            {stripeEnabled && (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Opening Stripe checkout..." : "Renew plan"}
              </button>
            )}
            {error && <p className="text-sm text-danger-500">{error}</p>}
          </div>
        ) : stripeEnabled ? (
          <>
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Opening Stripe checkout..."
                : hasActiveSubscription
                  ? `Upgrade to ${plan.name}`
                  : "Subscribe now"}
            </button>
            {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
          </>
        ) : (
          <p className="text-center text-sm text-neutral-500">
            Online payment is being configured. Contact support to subscribe.
          </p>
        )}
      </div>
    </div>
  );
}
