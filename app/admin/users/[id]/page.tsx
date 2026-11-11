import { notFound } from "next/navigation";
import { getUserById } from "@/lib/data/users";
import { getAllTools } from "@/lib/data/tools";
import { getAllPlans } from "@/lib/data/plans";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToolAssignModal } from "@/components/admin/ToolAssignModal";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";
import { SubscriptionAssignPanel } from "@/components/admin/SubscriptionAssignPanel";
import { LoginHistoryPanel } from "@/components/admin/LoginHistoryPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  countDistinctLoginIps,
  getUserLoginEvents,
} from "@/lib/auth/login-audit";

type PageProps = { params: { id: string } };

export default async function AdminUserDetailPage({ params }: PageProps) {
  const [user, allTools, plans, loginEvents, distinctIps] = await Promise.all([
    getUserById(params.id),
    getAllTools(),
    getAllPlans(),
    getUserLoginEvents(params.id, 50),
    countDistinctLoginIps(params.id),
  ]);

  if (!user) notFound();

  const accessMap = Object.fromEntries(
    user.toolAccess.map((a) => [a.toolId, a.status])
  );
  const activeAccess = user.toolAccess.filter((a) => a.status === "ACTIVE");
  const activePlans = plans.filter((p) => p.active);

  return (
    <DashboardShell variant="admin" pageTitle={user.name} pageSubtitle={user.email}>
      <PageHeader
        title={user.name}
        description={user.email}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={user.status} />
            <UserStatusToggle
              userId={user.id}
              status={user.status}
              email={user.email}
            />
            <ToolAssignModal
              userId={user.id}
              allTools={allTools}
              userToolIds={user.toolAccess.map((a) => a.toolId)}
              accessMap={accessMap}
            />
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Role" value={user.role} accent="neutral" />
        <StatCard
          label="Subscriptions"
          value={user.subscriptions.length}
          accent="primary"
        />
        <StatCard
          label="Active tools"
          value={activeAccess.length}
          accent="accent"
        />
        <StatCard label="Login IPs" value={distinctIps} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionAssignPanel
          userId={user.id}
          subscriptions={user.subscriptions}
          plans={activePlans}
        />

        <div className="dashboard-panel">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Tool access
            </h2>
          </div>
          <div className="p-5">
            {user.toolAccess.length === 0 ? (
              <p className="text-sm text-neutral-500">No tool access.</p>
            ) : (
              <ul className="space-y-2">
                {user.toolAccess.map((access) => (
                  <li
                    key={access.id}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-neutral-50"
                  >
                    <div>
                      <span className="text-sm font-medium text-neutral-800">
                        {access.tool.name}
                      </span>
                      <p className="text-xs text-neutral-400">{access.source}</p>
                    </div>
                    <StatusBadge status={access.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <LoginHistoryPanel events={loginEvents} distinctIps={distinctIps} />
    </DashboardShell>
  );
}
