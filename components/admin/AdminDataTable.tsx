import { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type AdminDataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptyAction?: ReactNode;
};

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  emptyAction,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-14 text-center">
        <p className="text-sm text-neutral-600">{emptyMessage}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="dashboard-panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-neutral-50 last:border-0 transition-colors hover:bg-neutral-50/60"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-3.5 text-collab-yellow ${col.className ?? ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
