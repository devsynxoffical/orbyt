import { redirect } from "next/navigation";
import { getAppBaseUrl } from "@/lib/config/site";
import { getAllTools } from "@/lib/data/tools";
import { getAdminExtendedStats, getRecentUsers } from "@/lib/data/dashboard";
import { getPaymentAdminStats } from "@/lib/data/payment-orders";
import { requireLiveUserPage } from "@/lib/auth/live-session";

export async function requireAdminSession() {
  const live = await requireLiveUserPage("/admin/login");
  if (live.role !== "ADMIN") {
    redirect(`${getAppBaseUrl()}/dashboard`);
  }
  return live.session;
}

export async function loadAdminDashboardData() {
  const [tools, stats, recentUsers, paymentStats] = await Promise.all([
    getAllTools(),
    getAdminExtendedStats(),
    getRecentUsers(5),
    getPaymentAdminStats(),
  ]);
  return { tools, stats, recentUsers, paymentStats };
}
