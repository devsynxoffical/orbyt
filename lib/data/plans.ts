import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";

export type PlanWithTools = {
  id: string;
  name: string;
  description: string | null;
  pricePkr: number;
  durationDays: number;
  active: boolean;
  tools: { tool: { id: string; name: string; slug: string } }[];
};

function mapMockPlan(plan: (typeof mockStore.plans)[number]): PlanWithTools {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    pricePkr: plan.pricePkr,
    durationDays: plan.durationDays,
    active: plan.active,
    tools: plan.toolIds.map((toolId) => {
      const tool = mockStore.tools.find((t) => t.id === toolId)!;
      return { tool: { id: tool.id, name: tool.name, slug: tool.slug } };
    }),
  };
}

export async function getActivePlans(): Promise<PlanWithTools[]> {
  if (isMockMode()) {
    return mockStore.plans
      .filter((p) => p.active)
      .map(mapMockPlan)
      .sort((a, b) => a.pricePkr - b.pricePkr);
  }

  return prisma.plan.findMany({
    where: { active: true },
    include: { tools: { include: { tool: true } } },
    orderBy: { pricePkr: "asc" },
  });
}

export async function getAllPlans(): Promise<PlanWithTools[]> {
  if (isMockMode()) {
    return mockStore.plans
      .map(mapMockPlan)
      .sort((a, b) => a.pricePkr - b.pricePkr);
  }

  return prisma.plan.findMany({
    include: { tools: { include: { tool: true } } },
    orderBy: { pricePkr: "asc" },
  });
}

export async function getPlanById(id: string): Promise<PlanWithTools | null> {
  if (isMockMode()) {
    const plan = mockStore.plans.find((p) => p.id === id);
    if (!plan) return null;
    return mapMockPlan(plan);
  }

  return prisma.plan.findUnique({
    where: { id },
    include: { tools: { include: { tool: true } } },
  });
}
