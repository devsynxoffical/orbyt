import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToolBySlug } from "@/lib/data/tools";
import { getActiveBankAccounts } from "@/lib/data/bank-accounts";
import { getPlatformSettings } from "@/lib/data/platform-settings";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { BuyToolForm } from "@/components/payments/BuyToolForm";

type Props = {
  params: { slug: string };
};

export default async function BuyToolPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/dashboard/buy/${params.slug}`);

  const tool = await getToolBySlug(params.slug);
  if (!tool || !tool.active || tool.pricePkr <= 0) notFound();

  const [banks, settings] = await Promise.all([
    getActiveBankAccounts(),
    getPlatformSettings(),
  ]);

  return (
    <DashboardShell variant="user">
      <PageHeader
        title="Buy tool access"
        description="Pay via bank transfer, upload proof, and wait for admin approval."
      />
      <BuyToolForm
        tool={{
          id: tool.id,
          name: tool.name,
          slug: tool.slug,
          pricePkr: tool.pricePkr,
          accessDurationDays: tool.accessDurationDays,
          description: tool.description,
        }}
        banks={banks}
        settings={settings}
        userName={session.user.name ?? "User"}
      />
    </DashboardShell>
  );
}
