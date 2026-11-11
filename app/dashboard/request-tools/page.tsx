import { getAllTools } from "@/lib/data/tools";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserToolPicker } from "@/components/dashboard/UserToolPicker";

export default async function RequestToolsPage() {
  const tools = await getAllTools();

  return (
    <DashboardShell variant="user">
      <PageHeader
        title="Request tools"
        description="Pick the SEO tools you need. Your admin will review and grant access — you're not limited to pre-assigned bundles."
      />
      <UserToolPicker tools={tools} />
    </DashboardShell>
  );
}
