import { Suspense } from "react";
import {
  getAllPaymentOrders,
  getPaymentAdminStats,
  getPendingPaymentOrders,
} from "@/lib/data/payment-orders";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PaymentsQueue } from "@/components/admin/PaymentsQueue";
import { PaymentsTabs } from "@/components/admin/PaymentsTabs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { status?: string };
};

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const showAll = searchParams.status === "all";
  const [orders, stats] = await Promise.all([
    showAll ? getAllPaymentOrders() : getPendingPaymentOrders(),
    getPaymentAdminStats(),
  ]);

  return (
    <DashboardShell
      variant="admin"
      pageTitle="Payments"
      pageSubtitle="Bank transfers and Stripe card payments"
    >
      <PageHeader
        title="Payments"
        description="Review bank transfer screenshots or monitor Stripe card payments. Stripe orders are approved automatically after payment."
        action={
          stats.pendingManual > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              {stats.pendingManual} awaiting review
            </span>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Pending review
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pendingManual}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Stripe checkout
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-600">{stats.pendingStripe}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Approved
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Stripe orders
          </p>
          <p className="mt-1 text-2xl font-bold text-collab-dark">{stats.stripeTotal}</p>
        </div>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <PaymentsTabs pendingCount={stats.pendingManual} />
      </Suspense>
      <div className="mt-6">
        <PaymentsQueue orders={orders} showAll={showAll} />
      </div>
    </DashboardShell>
  );
}
