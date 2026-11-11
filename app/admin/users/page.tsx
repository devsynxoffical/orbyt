import Link from "next/link";
import { getUsers } from "@/lib/data/users";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { UserCreateForm } from "@/components/admin/UserCreateForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";
import { UserSearchForm } from "@/components/admin/UserSearchForm";
import { PageHeader } from "@/components/ui/PageHeader";

type PageProps = {
  searchParams: { search?: string; status?: string };
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const status =
    searchParams.status === "ACTIVE" ||
    searchParams.status === "SUSPENDED" ||
    searchParams.status === "LOCKED"
      ? searchParams.status
      : "ALL";

  const users = await getUsers({
    search: searchParams.search,
    status,
  });

  return (
    <DashboardShell variant="admin" pageTitle="Users" pageSubtitle="Manage platform users">
      <PageHeader
        title="Users"
        description={`${users.length} user${users.length === 1 ? "" : "s"} matching your filters`}
        action={<UserCreateForm />}
      />

      <div className="dashboard-panel mb-6 p-4">
        <UserSearchForm
          defaultSearch={searchParams.search ?? ""}
          defaultStatus={status}
        />
      </div>

      <AdminDataTable
        data={users}
        emptyMessage="No users found."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (u) => (
              <Link
                href={`/admin/users/${u.id}`}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                {u.name}
              </Link>
            ),
          },
          { key: "email", header: "Email", render: (u) => u.email },
          {
            key: "role",
            header: "Role",
            render: (u) => (
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {u.role}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (u) => <StatusBadge status={u.status} />,
          },
          {
            key: "subs",
            header: "Subs",
            render: (u) => u._count?.subscriptions ?? 0,
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (u) => (
              <UserStatusToggle userId={u.id} status={u.status} email={u.email} />
            ),
          },
        ]}
      />
    </DashboardShell>
  );
}
