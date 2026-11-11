import { listSupportThreadsForAdmin } from "@/lib/data/support";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminSupportInbox } from "@/components/support/AdminSupportInbox";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = {
  searchParams: { thread?: string };
};

export default async function AdminSupportPage({ searchParams }: Props) {
  const threads = await listSupportThreadsForAdmin();
  const activeThreadId =
    searchParams.thread ??
    threads.find((t) => t.adminUnreadCount > 0)?.id ??
    threads[0]?.id ??
    null;

  return (
    <DashboardShell
      variant="admin"
      pageTitle="Support"
      pageSubtitle="Chat with users from one inbox"
    >
      <PageHeader
        title="Support inbox"
        description="Users message you from Dashboard → Support. Replies appear in real time on their side."
      />
      <AdminSupportInbox threads={threads} activeThreadId={activeThreadId} />
    </DashboardShell>
  );
}
