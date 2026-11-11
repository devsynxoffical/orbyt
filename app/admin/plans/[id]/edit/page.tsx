import { notFound } from "next/navigation";
import { getPlanById } from "@/lib/data/plans";
import { getAllTools } from "@/lib/data/tools";
import { PlanEditorForm } from "@/components/admin/PlanEditorForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";

type PageProps = { params: { id: string } };

export default async function PlanEditPage({ params }: PageProps) {
  const isNew = params.id === "new";
  const [plan, allTools] = await Promise.all([
    isNew ? null : getPlanById(params.id),
    getAllTools(),
  ]);

  if (!isNew && !plan) notFound();

  return (
    <DashboardShell variant="admin">
      <PageHeader
        title={isNew ? "Create plan" : `Edit ${plan!.name}`}
        description={
          isNew
            ? "Define a new subscription tier and select included tools."
            : "Update pricing, visibility, and bundled tools for this plan."
        }
      />
      <PlanEditorForm plan={plan ?? undefined} allTools={allTools} />
    </DashboardShell>
  );
}
