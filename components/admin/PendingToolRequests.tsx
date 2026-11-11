import { getPendingToolRequests } from "@/lib/data/tool-requests";
import { PendingToolRequestsClient } from "@/components/admin/PendingToolRequestsClient";

export async function PendingToolRequests() {
  const requests = await getPendingToolRequests();
  return <PendingToolRequestsClient requests={requests} />;
}
