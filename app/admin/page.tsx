import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminQuickLinks } from "@/components/admin/AdminQuickLinks";
import { GrantAccessForm } from "@/components/admin/GrantAccessForm";
import { ModernStatCard } from "@/components/dashboard/ModernStatCard";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  loadAdminDashboardData,
  requireAdminSession,
} from "@/lib/data/admin-page";

export default async function AdminPage() {
  await requireAdminSession();

  let tools;
  let stats;
  let recentUsers;
  let paymentStats;

  try {
    ({ tools, stats, recentUsers, paymentStats } =
      await loadAdminDashboardData());
  } catch (err) {
    console.error("[admin] load failed", err);
    return (
      <DashboardShell
        variant="admin"
        pageTitle="Admin"
        pageSubtitle="Could not load dashboard"
      >
        <div className="dashboard-panel-modern mx-auto max-w-lg p-8 text-center">
          <p className="text-sm font-bold text-neutral-900">
            Could not load admin data
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Sign out and sign in again on{" "}
            <strong>admin portal</strong>. Clear cookies if
            needed.
          </p>
          <Link href="/signout" className="btn-primary mt-6 inline-block !px-6">
            Sign out
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const activeTools = tools.filter((t) => t.active);

  return (
    <DashboardShell
      variant="admin"
      pageTitle="Admin dashboard"
      pageSubtitle="Overview, access, and quick links"
    >
      <AdminQuickLinks />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <ModernStatCard
          label="Total users"
          value={stats.totalUsers}
          accent="blue"
          icon={<MaterialIcon name="group" className="text-2xl" />}
        />
        <ModernStatCard
          label="Active subs"
          value={stats.activeSubscriptions}
          accent="green"
          icon={<MaterialIcon name="verified" className="text-2xl" />}
        />
        <ModernStatCard
          label="Tools"
          value={stats.totalTools}
          accent="purple"
          icon={<MaterialIcon name="apps" className="text-2xl" />}
        />
        <Link href="/admin/payments" className="block">
          <ModernStatCard
            label="Payments due"
            value={paymentStats.pendingManual}
            accent="orange"
            icon={<MaterialIcon name="payments" className="text-2xl" />}
            hint={
              paymentStats.pendingStripe > 0
                ? `${paymentStats.pendingStripe} Stripe in progress`
                : undefined
            }
          />
        </Link>
        <ModernStatCard
          label="Suspended"
          value={stats.suspendedUsers}
          accent="pink"
          icon={<MaterialIcon name="block" className="text-2xl" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="dashboard-panel-modern p-6 sm:p-8 xl:col-span-2">
          <h2 className="mb-1 text-lg font-bold text-neutral-900">
            Grant access
          </h2>
          <p className="mb-6 text-sm text-neutral-500">
            Enter user email, select tools, and save. Changes appear instantly on
            the user dashboard.
          </p>
          <GrantAccessForm
            tools={activeTools.map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              iconUrl: t.iconUrl,
            }))}
          />
        </div>

        <div className="dashboard-panel-modern overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-bold text-neutral-900">Recent users</h2>
            <p className="text-xs text-neutral-500">Latest signups</p>
          </div>
          <ul className="divide-y divide-neutral-50">
            {recentUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {user.email}
                    </p>
                  </div>
                  <MaterialIcon
                    name="chevron_right"
                    className="shrink-0 text-neutral-300"
                  />
                </Link>
              </li>
            ))}
            {recentUsers.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-neutral-500">
                No users yet
              </li>
            )}
          </ul>
          <div className="border-t border-neutral-100 px-5 py-3">
            <Link
              href="/admin/users"
              className="text-sm font-bold text-collab-dark hover:text-collab-dark/70"
            >
              View all users →
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
