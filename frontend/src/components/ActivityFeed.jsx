import { useFleet } from "@/context/FleetContext";
import { Truck, CheckCircle2, Wrench, UserCheck, PlusCircle } from "lucide-react";

const typeConfig = {
  "in-progress": { icon: Truck, colorClass: "text-status-transit bg-status-transit-bg" },
  completed: { icon: CheckCircle2, colorClass: "text-status-available bg-status-available-bg" },
  cancelled: { icon: Wrench, colorClass: "text-status-maintenance bg-status-maintenance-bg" },
  pending: { icon: PlusCircle, colorClass: "text-primary bg-primary/10" },
};

export function ActivityFeed() {
  const { jobs, getTruckById, getDriverById } = useFleet();

  // Build activity from recent jobs
  const activities = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((job) => {
      const truck = job.truckId ? getTruckById(job.truckId) : null;
      const driver = job.driverId ? getDriverById(job.driverId) : null;
      let message = "";
      switch (job.status) {
        case "in-progress":
          message = `${truck?.registration ?? job.truckId} departed ${job.pickupLocation} → ${job.deliveryLocation}`;
          break;
        case "completed":
          message = `${job.id} completed: ${job.pickupLocation} → ${job.deliveryLocation}`;
          break;
        case "cancelled":
          message = `${job.id} cancelled: ${job.pickupLocation} → ${job.deliveryLocation}`;
          break;
        case "pending":
          message = `New job ${job.id}: ${job.pickupLocation} → ${job.deliveryLocation}`;
          break;
      }
      return { id: job.id, message, status: job.status, createdAt: job.createdAt };
    });

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-display text-base font-semibold">Recent Activity</h3>
        <p className="text-xs text-muted-foreground">Latest fleet updates</p>
      </div>
      <div className="divide-y">
        {activities.map((item) => {
          const config = typeConfig[item.status];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors">
              <div className={`mt-0.5 rounded-lg p-1.5 ${config.colorClass}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{item.message}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
