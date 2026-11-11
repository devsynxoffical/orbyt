import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/data/platform-settings";
import { getUserSupportThread } from "@/lib/data/support";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SupportChatPanel } from "@/components/support/SupportChatPanel";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default async function DashboardSupportPage() {
  const userSession = await getServerSession(authOptions);
  const userId = userSession!.user.id;

  const [thread, settings] = await Promise.all([
    getUserSupportThread(userId),
    getPlatformSettings(),
  ]);

  const whatsappUrl =
    settings.whatsappNumber &&
    buildWhatsAppUrl(
      settings.whatsappNumber,
      "Hi Orbyt Rush support, I need help with my account."
    );

  return (
    <DashboardShell
      variant="user"
      pageTitle="Support"
      pageSubtitle="Chat with our team or reach us on WhatsApp"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-900 transition hover:bg-green-100"
          >
            <MaterialIcon name="chat" className="text-xl text-green-700" />
            <span className="flex-1">Prefer WhatsApp? Message us there</span>
            <MaterialIcon name="open_in_new" className="text-base opacity-60" />
          </a>
        )}

        {thread ? (
          <SupportChatPanel threadId={thread.id} mode="user" />
        ) : (
          <p className="text-center text-sm text-neutral-500">
            Support chat is unavailable in demo mode.
          </p>
        )}

        <p className="text-center text-xs text-neutral-400">
          For payment proofs, you can also use{" "}
          <a
            href="/dashboard/orders"
            className="font-bold text-collab-dark hover:underline"
          >
            Orders
          </a>
          .
        </p>
      </div>
    </DashboardShell>
  );
}
