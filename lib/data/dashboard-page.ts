import { redirect } from "next/navigation";
import { adminUrl } from "@/lib/config/site";
import { getAllTools, getUserToolAccess } from "@/lib/data/tools";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { requireLiveUserPage } from "@/lib/auth/live-session";

export async function requireUserDashboardSession() {
  const live = await requireLiveUserPage("/login");

  return { session: live.session, userId: live.userId };
}

export async function loadUserDashboardData(userId: string) {
  const [allTools, toolAccess, stats] = await Promise.all([
    getAllTools(),
    getUserToolAccess(userId),
    getUserDashboardStats(userId),
  ]);

  return { allTools, toolAccess, stats };
}
