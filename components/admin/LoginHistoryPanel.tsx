type LoginRow = {
  id: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  suspicious: boolean;
  reason: string | null;
  createdAt: Date;
};

function briefUa(ua: string | null): string {
  if (!ua) return "—";
  if (/iPhone|iPad/i.test(ua)) return "iPhone/iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS|Macintosh/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return ua.length > 48 ? `${ua.slice(0, 48)}…` : ua;
}

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

type LoginHistoryPanelProps = {
  events: LoginRow[];
  distinctIps: number;
};

export function LoginHistoryPanel({
  events,
  distinctIps,
}: LoginHistoryPanelProps) {
  return (
    <div className="dashboard-panel mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Login sessions
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {distinctIps} distinct IP{distinctIps === 1 ? "" : "s"} · last{" "}
            {events.length} event{events.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto p-2 sm:p-3">
        {events.length === 0 ? (
          <p className="px-3 py-6 text-sm text-neutral-500">
            No login records yet. They appear after the user signs in (with this
            update deployed).
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                <th className="px-3 py-2 font-medium">When (UTC)</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">Device</th>
                <th className="px-3 py-2 font-medium">Result</th>
                <th className="px-3 py-2 font-medium">Flag</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-neutral-50 last:border-0"
                >
                  <td className="px-3 py-2.5 text-neutral-700">
                    {formatWhen(e.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-neutral-800">
                    {e.ip ?? "—"}
                  </td>
                  <td
                    className="max-w-[200px] truncate px-3 py-2.5 text-neutral-600"
                    title={e.userAgent ?? undefined}
                  >
                    {briefUa(e.userAgent)}
                  </td>
                  <td className="px-3 py-2.5">
                    {e.success ? (
                      <span className="text-xs font-semibold text-accent-600">
                        OK
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-danger-500">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-neutral-500">
                    {e.suspicious ? (
                      <span className="font-semibold text-warning-600">
                        {e.reason?.replace(/_/g, " ") ?? "Suspicious"}
                      </span>
                    ) : (
                      e.reason?.replace(/_/g, " ") ?? "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
