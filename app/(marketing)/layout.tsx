import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MarketingShell } from "@/components/layout/MarketingShell";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MarketingShell navbar={<Navbar />}>{children}</MarketingShell>
  );
}
