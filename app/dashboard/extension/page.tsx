import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExtensionInstallPanel } from "@/components/dashboard/ExtensionInstallPanel";

export default function DashboardExtensionPage() {
  return (
    <DashboardShell
      variant="user"
      pageTitle="Tool launcher extension"
      pageSubtitle="Download once, then launch Canva and similar tools in one click"
    >
      <ExtensionInstallPanel />
    </DashboardShell>
  );
}
