"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PaymentsTabsProps = {
  pendingCount: number;
};

export function PaymentsTabs({ pendingCount }: PaymentsTabsProps) {
  const searchParams = useSearchParams();
  const current = searchParams.get("status") === "all" ? "all" : "pending";

  const tabs = [
    { id: "pending", label: "Pending", href: "/admin/payments", count: pendingCount },
    { id: "all", label: "All orders", href: "/admin/payments?status=all" },
  ] as const;

  return (
    <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 w-fit">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            current === tab.id
              ? "bg-neutral-0 text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {tab.label}
          {"count" in tab && tab.count != null && tab.count > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
