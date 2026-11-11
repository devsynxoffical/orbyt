import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTools } from "@/lib/data/tools";
import { getToolAccounts } from "@/lib/data/tool-accounts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolAccountsPanel } from "@/components/admin/ToolAccountsPanel";

type Props = {
  params: { id: string };
};

export default async function ToolAccountsPage({ params }: Props) {
  const tools = await getAllTools();
  const tool = tools.find((t) => t.id === params.id);
  if (!tool) notFound();

  const accounts = await getToolAccounts(tool.id);

  return (
    <DashboardShell variant="admin" pageTitle="Tool accounts" pageSubtitle="Manage cookie sessions">
      <PageHeader
        title={`${tool.name} — accounts`}
        description="Manage shared login sessions (encrypted cookies) for this tool."
        action={
          <Link
            href="/admin/tools"
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            Back to tools
          </Link>
        }
      />
      <ToolAccountsPanel
        toolId={tool.id}
        toolName={tool.name}
        launchUrl={tool.launchUrl}
        accounts={accounts}
      />
    </DashboardShell>
  );
}
