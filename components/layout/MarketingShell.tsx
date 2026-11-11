import { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";

type MarketingShellProps = {
  navbar: ReactNode;
  children: ReactNode;
};

export function MarketingShell({ navbar, children }: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAF9F5]">
      <div className="sticky top-0 z-50">
        {navbar}
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
