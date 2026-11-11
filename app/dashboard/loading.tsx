import { RouteLoading } from "@/components/ui/RouteLoading";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-collab-gray">
      <RouteLoading label="Loading dashboard..." />
    </div>
  );
}
