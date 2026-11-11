import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminUrl, getAppBaseUrl } from "@/lib/config/site";
import {
  adminNavSections,
  userNavSections,
} from "@/components/dashboard/DashboardSidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  variant: "user" | "admin";
  pageTitle?: string;
  pageSubtitle?: string;
};

export async function DashboardShell({
  children,
  variant,
  pageTitle,
  pageSubtitle,
}: DashboardShellProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(variant === "admin" ? "/admin/login" : "/login");
  }

  if (variant === "admin" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navSections =
    variant === "admin" ? adminNavSections : userNavSections;

  return (
    <DashboardLayout
      variant={variant}
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      navSections={navSections}
    >
      {children}
    </DashboardLayout>
  );
}
