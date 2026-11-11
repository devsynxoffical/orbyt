import { RouteLoading } from "@/components/ui/RouteLoading";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-collab-gray">
      <RouteLoading label="Loading admin..." />
    </div>
  );
}
