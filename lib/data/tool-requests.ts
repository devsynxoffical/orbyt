import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import { getAllTools } from "@/lib/data/tools";
import { prisma } from "@/lib/prisma";

export type ToolRequestView = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  toolIds: string[];
  note: string | null;
  status: string;
  createdAt: Date;
  tools: { id: string; name: string }[];
};

export async function getPendingToolRequests(): Promise<ToolRequestView[]> {
  const tools = await getAllTools();

  if (isMockMode()) {
    const requests = mockStore.toolRequests ?? [];
    return requests
      .filter((r) => r.status === "PENDING")
      .map((r) => ({
        ...r,
        tools: r.toolIds
          .map((id) => tools.find((t) => t.id === id))
          .filter(Boolean) as { id: string; name: string }[],
      }));
  }

  const requests = await prisma.toolRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    userEmail: r.user.email,
    toolIds: r.toolIds,
    note: r.note,
    status: r.status,
    createdAt: r.createdAt,
    tools: r.toolIds
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean) as { id: string; name: string }[],
  }));
}
