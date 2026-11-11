import { getToolsCatalogView } from "@/lib/data/tool-catalog";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminToolsHub } from "@/components/admin/AdminToolsHub";
import { QuickAddTools } from "@/components/admin/QuickAddTools";
import { PendingToolRequests } from "@/components/admin/PendingToolRequests";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default async function AdminToolsPage() {
  const { active, catalog } = await getToolsCatalogView();
  const availableCount = catalog.filter((t) => !t.integrated).length;

  return (
    <DashboardShell
      variant="admin"
      pageTitle="Tools"
      pageSubtitle="Catalog, cookies, and launch settings"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          {active.length} active tool{active.length === 1 ? "" : "s"} ·{" "}
          {availableCount} ready to integrate from catalog
        </p>
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1 text-sm font-bold text-collab-dark hover:underline"
        >
          <MaterialIcon name="forum" className="text-base" />
          User support inbox
        </Link>
      </div>

      <AdminToolsHub
        activeTools={active}
        catalog={catalog}
        availableCount={availableCount}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <PendingToolRequests />
        <QuickAddTools />
      </div>
    </DashboardShell>
  );
}
