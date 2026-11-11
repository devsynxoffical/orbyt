"use client";

import { ReactNode, useState } from "react";
import {
  DashboardSidebar,
  adminNavSections,
  userNavSections,
  type DashboardNavSection,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

type DashboardLayoutProps = {
  children: ReactNode;
  variant: "user" | "admin";
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  pageTitle?: string;
  pageSubtitle?: string;
  navSections?: DashboardNavSection[];
};

export function DashboardLayout({
  children,
  variant,
  userName,
  userEmail,
  userRole,
  pageTitle,
  pageSubtitle,
  navSections,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const homeHref = variant === "admin" ? "/admin" : "/dashboard";
  const sections =
    navSections ?? (variant === "admin" ? adminNavSections : userNavSections);
  const defaultTitle = variant === "admin" ? "Admin Dashboard" : "My Dashboard";

  return (
    <div className="dashboard-modern-root min-h-screen bg-collab-gray">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-neutral-950/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop fixed, mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar
          sections={sections}
          homeHref={homeHref}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="lg:pl-[270px]">
        <DashboardHeader
          title={pageTitle ?? defaultTitle}
          subtitle={pageSubtitle}
          homeHref={homeHref}
          onMenuClick={() => setMobileOpen((v) => !v)}
          userName={userName}
          userRole={userRole}
          variant={variant}
        />
        <main className="px-3 py-5 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
