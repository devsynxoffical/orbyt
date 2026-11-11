import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActivePlans } from "@/lib/data/plans";
import { getUserSubscription } from "@/lib/data/tools";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SubscriptionSummaryCard } from "@/components/dashboard/SubscriptionSummaryCard";
import { SubscriptionPlans } from "@/components/dashboard/SubscriptionPlans";
import { verifyStripeCheckoutSession } from "@/lib/payments/verify-stripe-checkout";

type Props = {
  searchParams: { activated?: string; canceled?: string; session_id?: string };
};

export default async function SubscriptionPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/subscription");
  }
  const userId = session.user.id;

  if (searchParams.session_id) {
    await verifyStripeCheckoutSession(searchParams.session_id, userId);
  }

  const [subscription, plans] = await Promise.all([
    getUserSubscription(userId),
    getActivePlans(),
  ]);

  const hasActiveSubscription =
    subscription && subscription.status === "ACTIVE";

  return (
    <DashboardShell
      variant="user"
      pageTitle="Your subscription"
      pageSubtitle="Choose a plan — access is granted instantly after payment"
    >
      {searchParams.activated === "1" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Payment successful! Your plan is now active and tools have been unlocked.
        </div>
      )}

      {searchParams.canceled === "1" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Checkout was canceled. You can try again when you&apos;re ready.
        </div>
      )}

      {hasActiveSubscription && (
        <div className="mb-8">
          <SubscriptionSummaryCard
            planName={subscription.plan?.name ?? "No plan assigned"}
            tools={
              subscription.plan?.tools.map((t) => ({
                name: t.tool.name,
                slug: t.tool.slug,
              })) ?? []
            }
            startedAt={subscription.startedAt}
            expiryDate={subscription.expiresAt}
            status={subscription.status}
            pricePkr={subscription.plan?.pricePkr ?? 0}
            notes={subscription.notes}
          />
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-900">
          {hasActiveSubscription ? "Upgrade or change plan" : "Choose a plan"}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pay with card via Stripe. All tools in your plan unlock immediately — no
          admin approval needed.
        </p>
      </div>

      <SubscriptionPlans
        plans={plans}
        currentPlanId={hasActiveSubscription ? subscription.plan?.id : null}
        hasActiveSubscription={!!hasActiveSubscription}
      />
    </DashboardShell>
  );
}
