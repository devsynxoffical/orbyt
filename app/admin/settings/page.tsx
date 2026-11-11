import { getPlatformSettings } from "@/lib/data/platform-settings";
import { getAllBankAccounts } from "@/lib/data/bank-accounts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";
import { BankAccountsPanel } from "@/components/admin/BankAccountsPanel";

export default async function AdminSettingsPage() {
  const [settings, banks] = await Promise.all([
    getPlatformSettings(),
    getAllBankAccounts(),
  ]);

  return (
    <DashboardShell
      variant="admin"
      pageTitle="Platform settings"
      pageSubtitle="Banks, WhatsApp, and payment instructions"
    >
      <PageHeader
        title="Settings"
        description="Payment instructions, WhatsApp support, and bank accounts for manual payments."
      />
      <div className="space-y-8">
        <PlatformSettingsForm settings={settings} />
        <BankAccountsPanel accounts={banks} />
      </div>
    </DashboardShell>
  );
}
