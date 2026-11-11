import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const links = [
  {
    href: "/admin/users",
    icon: "group",
    title: "Users",
    description: "Search, suspend, or open a profile",
  },
  {
    href: "/admin/support",
    icon: "forum",
    title: "Support inbox",
    description: "Chat with users who need help",
  },
  {
    href: "/admin/payments",
    icon: "payments",
    title: "Payments",
    description: "Approve or reject manual orders",
  },
  {
    href: "/admin/tools",
    icon: "apps",
    title: "Tools",
    description: "Catalog, cookies, launch modes",
  },
  {
    href: "/admin/plans",
    icon: "card_membership",
    title: "Plans",
    description: "Bundles and pricing",
  },
  {
    href: "/admin/settings",
    icon: "settings",
    title: "Settings",
    description: "WhatsApp, banks, platform copy",
  },
] as const;

export function AdminQuickLinks() {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-collab-yellow hover:shadow-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-collab-yellow/50 text-collab-dark transition group-hover:bg-collab-dark group-hover:text-collab-yellow">
            <MaterialIcon name={item.icon} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">{item.title}</p>
            <p className="text-xs text-neutral-500">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
