import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsPageClient } from "@/components/dashboard/SettingsForm";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <DashboardShell
      variant="user"
      pageTitle="Account settings"
      pageSubtitle="Update your profile and password"
    >
      <div className="dashboard-panel-modern max-w-xl p-6 sm:p-8">
        <SessionProvider>
          <SettingsPageClient
            email={session?.user?.email ?? ""}
            name={session?.user?.name ?? ""}
          />
        </SessionProvider>
      </div>
    </DashboardShell>
  );
}
