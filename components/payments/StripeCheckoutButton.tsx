"use client";

import { useState } from "react";
import { isStripeEnabled } from "@/lib/config/site";

type StripeCheckoutButtonProps = {
  toolId: string;
  label?: string;
  className?: string;
};

export function StripeCheckoutButton({
  toolId,
  label = "Pay with card (Stripe)",
  className = "btn-primary",
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isStripeEnabled()) return null;

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
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
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading ? "Redirecting to Stripe..." : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
}
