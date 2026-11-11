import Link from "next/link";
import { getAllPlans } from "@/lib/data/plans";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminPlansPage() {
  const plans = await getAllPlans();

  return (
    <DashboardShell variant="admin">
      <PageHeader
        title="Plans"
        description="Configure pricing tiers and bundle tools into subscription plans."
        action={
          <Link
            href="/admin/plans/new/edit"
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-0 shadow-sm hover:bg-primary-600"
          >
            Create plan
          </Link>
        }
      />

      <AdminDataTable
        data={plans}
        emptyMessage="No plans configured."
        emptyAction={
          <Link
            href="/admin/plans/new/edit"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Create your first plan
          </Link>
        }
        columns={[
          {
            key: "name",
            header: "Plan",
            render: (p) => (
              <div>
                <Link
                  href={`/admin/plans/${p.id}/edit`}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  {p.name}
                </Link>
                {p.description && (
                  <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">
                    {p.description}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "price",
            header: "Price",
            render: (p) => (
              <span className="font-medium text-collab-yellow">
                PKR {p.pricePkr.toLocaleString()}
                <span className="text-neutral-400"> / {p.durationDays} days</span>
              </span>
            ),
          },
          {
            key: "tools",
            header: "Tools",
            render: (p) => (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {p.tools.length} tools
              </span>
            ),
          },
          {
            key: "active",
            header: "Status",
            render: (p) => (
              <StatusBadge
                status={p.active ? "ACTIVE" : "CANCELED"}
                label={p.active ? "Active" : "Inactive"}
              />
            ),
          },
        ]}
      />
    </DashboardShell>
  );
}
