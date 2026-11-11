"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approvePaymentOrder,
  rejectPaymentOrder,
} from "@/lib/actions/payments";
import type { PaymentOrderView } from "@/lib/data/payment-orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToolLogo } from "@/components/ui/ToolLogo";

type PaymentsQueueProps = {
  orders: PaymentOrderView[];
  showAll?: boolean;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function PaymentsQueue({ orders, showAll = false }: PaymentsQueueProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (orderId: string) => {
    setBusyId(orderId);
    setError(null);
    try {
      await approvePaymentOrder(orderId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!rejectNote.trim()) {
      setError("Please enter a rejection reason");
      return;
    }
    setBusyId(orderId);
    setError(null);
    try {
      await rejectPaymentOrder(orderId, rejectNote);
      setRejectingId(null);
      setRejectNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="dashboard-panel p-6 text-sm text-neutral-500">
        {showAll ? "No payment orders yet." : "No pending payments — you're all caught up."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
          {error}
        </p>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="dashboard-panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ToolLogo
                    name={order.tool.name}
                    slug={order.tool.slug}
                    size="sm"
                    nameClassName="font-semibold text-neutral-900"
                  />
                  <StatusBadge status={order.status} />
                  {order.paymentMethod === "STRIPE" && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                      Stripe
                    </span>
                  )}
                  {order.paymentMethod === "MANUAL" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      Bank transfer
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  {order.user.name} · {order.user.email}
                </p>
                <p className="text-lg font-bold text-primary-700">
                  PKR {order.amountPkr.toLocaleString()}
                </p>
                <div className="text-sm text-neutral-500">
                  {order.bankAccount ? (
                    <>
                      <p>
                        Bank: {order.bankAccount.bankName} — {order.bankAccount.accountTitle}
                      </p>
                      <p className="font-mono">{order.bankAccount.accountNumber}</p>
                    </>
                  ) : (
                    <p>Paid via Stripe</p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400">
                    Submitted {formatDate(order.createdAt)} · Order {order.id}
                  </p>
                </div>
                {order.userNote && (
                  <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    User note: {order.userNote}
                  </p>
                )}
                {order.adminNote && order.status !== "PENDING" && (
                  <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    Admin note: {order.adminNote}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                {order.screenshotUrl && (
                  <a
                    href={order.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-neutral-200"
                  >
                    <img
                      src={order.screenshotUrl}
                      alt="Payment screenshot"
                      className="h-40 w-full max-w-xs object-cover"
                    />
                  </a>
                )}

                {order.status === "PENDING" && order.paymentMethod === "STRIPE" && (
                  <p className="rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-700">
                    Waiting for customer to complete Stripe checkout. Access is
                    granted automatically when paid.
                  </p>
                )}

                {order.status === "PENDING" && order.paymentMethod !== "STRIPE" && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => handleApprove(order.id)}
                      className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-600 disabled:opacity-60"
                    >
                      {busyId === order.id ? "Processing..." : "Approve & grant access"}
                    </button>
                    {rejectingId === order.id ? (
                      <div className="space-y-2">
                        <input
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Reason for rejection"
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === order.id}
                            onClick={() => handleReject(order.id)}
                            className="rounded-lg bg-danger-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                          >
                            Confirm reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectNote("");
                            }}
                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRejectingId(order.id)}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
